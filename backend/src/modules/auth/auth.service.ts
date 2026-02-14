import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, VerificationStatus } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private notificationService: NotificationService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; token: string }> {
    const { email, password, firstName, lastName, phoneNumber } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      verificationStatus: VerificationStatus.UNVERIFIED,
    });

    await this.userRepository.save(user);

    // Send welcome notification
    await this.notificationService.sendNewUserNotification(user);

    // Generate token
    const token = this.generateToken(user);

    // Return user without sensitive data
    const { password: _, ...result } = user;
    return { user: result, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['profile']
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate token
    const token = this.generateToken(user);

    // Return user without sensitive data
    const { password: _, ...result } = user;
    return { user: result, token };
  }

  async verifyEmail(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verificationStatus === VerificationStatus.UNVERIFIED) {
      user.verificationStatus = VerificationStatus.EMAIL_VERIFIED;
    } else if (user.verificationStatus === VerificationStatus.PHONE_VERIFIED) {
      user.verificationStatus = VerificationStatus.FULLY_VERIFIED;
    }
    
    await this.userRepository.save(user);

    await this.notificationService.sendEmailVerifiedNotification(user);

    return { message: 'Email verified successfully' };
  }

  async sendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.notificationService.sendVerificationEmail(user);
    
    return { message: 'Verification email sent' };
  }

  async verifyPhone(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verificationStatus === VerificationStatus.UNVERIFIED) {
      user.verificationStatus = VerificationStatus.PHONE_VERIFIED;
    } else if (user.verificationStatus === VerificationStatus.EMAIL_VERIFIED) {
      user.verificationStatus = VerificationStatus.FULLY_VERIFIED;
    }
    
    await this.userRepository.save(user);

    await this.notificationService.sendPhoneVerifiedNotification(user);

    return { message: 'Phone verified successfully' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return { message: 'If your email exists, you will receive a password reset link' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '1h' }
    );

    this.logger.log(`Password reset token for ${email}: ${resetToken}`);

    await this.notificationService.sendPasswordResetConfirmation(user);

    return { message: 'If your email exists, you will receive a password reset link' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      
      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      const saltRounds = 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
      await this.userRepository.save(user);

      await this.notificationService.sendPasswordChangeNotification(user);

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    await this.userRepository.save(user);

    await this.notificationService.sendPasswordChangeNotification(user);

    return { message: 'Password changed successfully' };
  }

  async enableTwoFactor(userId: string, ipAddress: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isTwoFactorEnabled = true;
    await this.userRepository.save(user);

    await this.notificationService.sendTwoFactorEnabledNotification(user);
    await this.notificationService.sendSecurityAlert(user, '2FA_ENABLED', { ipAddress });

    return { message: 'Two-factor authentication enabled' };
  }

  async disableTwoFactor(userId: string, ipAddress: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isTwoFactorEnabled = false;
    await this.userRepository.save(user);

    await this.notificationService.sendTwoFactorDisabledNotification(user);
    await this.notificationService.sendSecurityAlert(user, '2FA_DISABLED', { ipAddress });

    return { message: 'Two-factor authentication disabled' };
  }

  async sendSecurityAlertEmail(userId: string, alertType: string, details: any): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.notificationService.sendSecurityAlert(user, alertType, details);

    return { message: 'Security alert sent' };
  }

  async sendSuspiciousActivityAlert(userId: string, activity: any): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.notificationService.sendSuspiciousActivityAlert(user, activity);

    return { message: 'Suspicious activity alert sent' };
  }

  private generateToken(user: User): string {
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role 
    };
    return this.jwtService.sign(payload);
  }
}
