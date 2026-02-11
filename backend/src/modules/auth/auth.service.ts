import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addMinutes, isBefore } from 'date-fns';

import { User, AccountStatus, KycStatus, VerificationStatus } from '../user/entities/user.entity';
import { UserProfile, RiskLevel } from '../user/entities/user-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { NotificationService } from '../notification/notification.service';
import { RiskService } from '../risk/risk.service';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  kycStatus: KycStatus;
  verificationStatus: VerificationStatus;
  iat?: number;
  exp?: number;
}

interface LoginResponse {
  user: Omit<User, 'password' | 'refreshTokenHash'>;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
    private readonly riskService: RiskService,
  ) {}

  private get saltRounds(): number {
    return this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user already exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: [
          { email: registerDto.email.toLowerCase() },
          { phoneNumber: registerDto.phoneNumber },
        ],
      });

      if (existingUser) {
        if (existingUser.email === registerDto.email.toLowerCase()) {
          throw new ConflictException('User with this email already exists');
        }
        if (existingUser.phoneNumber === registerDto.phoneNumber) {
          throw new ConflictException('User with this phone number already exists');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        registerDto.password,
        this.saltRounds,
      );

      // Generate email verification token
      const emailVerificationToken = crypto
        .randomBytes(32)
        .toString('hex');
      const emailVerificationTokenExpiry = addDays(new Date(), 1);

      // Create user
      const user = queryRunner.manager.create(User, {
        id: uuidv4(),
        email: registerDto.email.toLowerCase(),
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
        dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null,
        role: registerDto.role,
        accountStatus: AccountStatus.PENDING,
        kycStatus: KycStatus.NOT_STARTED,
        verificationStatus: VerificationStatus.UNVERIFIED,
        emailVerificationToken,
        emailVerificationTokenExpiry,
        registrationIp: registerDto.ipAddress || '127.0.0.1',
        registrationUserAgent: registerDto.userAgent || 'CLI/1.0',
        acceptedTermsVersion: registerDto.termsVersion || '1.0',
        acceptedPrivacyVersion: registerDto.privacyVersion || '1.0',
        marketingConsent: registerDto.marketingConsent || false,
      });

      const savedUser = await queryRunner.manager.save(user);

      // Create user profile with initial risk assessment
      const initialCreditScore = await this.riskService.calculateInitialCreditScore(
        savedUser,
        registerDto,
      );

      const userProfile = queryRunner.manager.create(UserProfile, {
        id: uuidv4(),
        user: savedUser,
        riskLevel: initialCreditScore >= 700 ? RiskLevel.LOW : 
                  initialCreditScore >= 500 ? RiskLevel.MEDIUM : RiskLevel.HIGH,
        creditScore: initialCreditScore,
        totalLoanAmount: 0,
        totalRepaidAmount: 0,
        activeLoansCount: 0,
        completedLoansCount: 0,
        defaultedLoansCount: 0,
        totalInvestedAmount: 0,
        totalReturns: 0,
        averageReturnRate: 0,
      });

      await queryRunner.manager.save(userProfile);

      // Generate tokens
      const tokens = await this.generateTokens(savedUser);

      // Save refresh token hash
      const refreshTokenHash = await bcrypt.hash(
        tokens.refreshToken,
        this.saltRounds,
      );
      savedUser.refreshTokenHash = refreshTokenHash;
      await queryRunner.manager.save(savedUser);

      // Log registration
      await this.logAudit(
        queryRunner,
        savedUser.id,
        'REGISTER',
        `User registered with role: ${registerDto.role}`,
        registerDto.ipAddress,
        registerDto.userAgent,
      );

      // Emit registration event
      this.eventEmitter.emit('user.registered', {
        userId: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        verificationToken: emailVerificationToken,
      });

      // Send welcome email
      await this.notificationService.sendWelcomeEmail(
        savedUser.email,
        savedUser.firstName,
        emailVerificationToken,
      );

      // Send verification SMS if phone provided
      if (savedUser.phoneNumber) {
        const phoneVerificationCode = Math.floor(
          100000 + Math.random() * 900000,
        ).toString();
        
        savedUser.phoneVerificationCode = await bcrypt.hash(
          phoneVerificationCode,
          this.saltRounds,
        );
        savedUser.phoneVerificationCodeExpiry = addMinutes(new Date(), 15);
        
        await queryRunner.manager.save(savedUser);

        await this.notificationService.sendVerificationSMS(
          savedUser.phoneNumber,
          phoneVerificationCode,
        );
      }

      await queryRunner.commitTransaction();

      // Remove sensitive data from response
      const { password, refreshTokenHash: _, ...userWithoutSensitiveData } = savedUser;

      return {
        user: userWithoutSensitiveData as Omit<User, 'password' | 'refreshTokenHash'>,
        tokens: {
          ...tokens,
          tokenType: 'Bearer',
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Failed to register user');
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    try {
      // Find user with profile
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email.toLowerCase() },
        relations: ['profile'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check account status
      this.validateAccountStatus(user);

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        // Log failed login attempt
        await this.logAuditDirect(
          user.id,
          'LOGIN_FAILED',
          'Invalid password',
          ipAddress,
          userAgent,
        );
        
        // Increment failed login attempts (in real app, implement lockout)
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if password needs to be changed (e.g., expired)
      if (this.isPasswordExpired(user)) {
        throw new ForbiddenException('Password has expired. Please reset your password.');
      }

      // Update last login and activity
      user.lastLoginAt = new Date();
      user.lastActivityAt = new Date();
      await this.userRepository.save(user);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Save refresh token hash
      const refreshTokenHash = await bcrypt.hash(
        tokens.refreshToken,
        this.saltRounds,
      );
      user.refreshTokenHash = refreshTokenHash;
      await this.userRepository.save(user);

      // Log successful login
      await this.logAuditDirect(
        user.id,
        'LOGIN_SUCCESS',
        'User logged in successfully',
        ipAddress,
        userAgent,
      );

      // Emit login event
      this.eventEmitter.emit('user.logged_in', {
        userId: user.id,
        email: user.email,
        ipAddress,
        userAgent,
      });

      // Remove sensitive data from response
      const { password, refreshTokenHash: _, ...userWithoutSensitiveData } = user;

      return {
        user: userWithoutSensitiveData as Omit<User, 'password' | 'refreshTokenHash'>,
        tokens: {
          ...tokens,
          tokenType: 'Bearer',
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      
      console.error('Login error:', error);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        ignoreExpiration: false,
      }) as TokenPayload;

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify refresh token matches stored hash
      const isValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!isValid) {
        // Possible token theft - invalidate all refresh tokens
        user.refreshTokenHash = null;
        await this.userRepository.save(user);
        
        await this.logAuditDirect(
          user.id,
          'REFRESH_TOKEN_THEFT',
          'Possible refresh token theft detected',
        );
        
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check account status
      this.validateAccountStatus(user);

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token hash
      const newRefreshTokenHash = await bcrypt.hash(
        tokens.refreshToken,
        this.saltRounds,
      );
      user.refreshTokenHash = newRefreshTokenHash;
      user.lastActivityAt = new Date();
      await this.userRepository.save(user);

      // Log token refresh
      await this.logAuditDirect(
        user.id,
        'TOKEN_REFRESHED',
        'Access token refreshed successfully',
      );

      return {
        ...tokens,
        tokenType: 'Bearer',
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      console.error('Token refresh error:', error);
      throw new InternalServerErrorException('Failed to refresh tokens');
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (user) {
        user.refreshTokenHash = null;
        user.lastActivityAt = new Date();
        await this.userRepository.save(user);

        await this.logAuditDirect(userId, 'LOGOUT', 'User logged out successfully');
        
        this.eventEmitter.emit('user.logged_out', { userId });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout failures
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Check if new password is same as old password
      const isSameAsOld = await bcrypt.compare(
        changePasswordDto.newPassword,
        user.password,
      );

      if (isSameAsOld) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Check password history (in real app, store password history)
      // For now, just check against last few passwords

      // Hash new password
      const hashedPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        this.saltRounds,
      );

      // Update password
      user.password = hashedPassword;
      user.lastPasswordChangeAt = new Date();
      user.refreshTokenHash = null; // Invalidate all refresh tokens
      
      await queryRunner.manager.save(user);

      // Log password change
      await this.logAudit(
        queryRunner,
        userId,
        'PASSWORD_CHANGED',
        'Password changed successfully',
        ipAddress,
        userAgent,
      );

      // Send notification
      await this.notificationService.sendPasswordChangeNotification(
        user.email,
        user.firstName,
        ipAddress,
        userAgent,
      );

      // Emit event
      this.eventEmitter.emit('user.password_changed', { userId });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if user exists (security best practice)
        return { resetToken: 'dummy_token_for_security' };
      }

      // Check if user can reset password
      if (!this.canResetPassword(user)) {
        throw new ForbiddenException('Account is not eligible for password reset');
      }

      // Generate reset token
      const resetToken = this.jwtService.sign(
        {
          sub: user.id,
          type: 'password_reset',
          jti: uuidv4(),
        },
        {
          secret: this.configService.get('JWT_RESET_SECRET'),
          expiresIn: '1h',
        },
      );

      // Save reset token hash (optional, for one-time use)
      const resetTokenHash = await bcrypt.hash(resetToken, this.saltRounds);
      // In real app, store in separate table with expiry

      // Send reset email
      await this.notificationService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken,
      );

      // Log reset request
      await this.logAuditDirect(
        user.id,
        'PASSWORD_RESET_REQUESTED',
        'Password reset requested',
      );

      return { resetToken };
    } catch (error) {
      console.error('Password reset request error:', error);
      throw new InternalServerErrorException('Failed to process password reset request');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify reset token
      const payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: this.configService.get('JWT_RESET_SECRET'),
        ignoreExpiration: false,
      }) as { sub: string; type: string; jti: string };

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user can reset password
      if (!this.canResetPassword(user)) {
        throw new ForbiddenException('Account is not eligible for password reset');
      }

      // Check if new password is same as old password
      const isSameAsOld = await bcrypt.compare(
        resetPasswordDto.newPassword,
        user.password,
      );

      if (isSameAsOld) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(
        resetPasswordDto.newPassword,
        this.saltRounds,
      );

      // Update password and invalidate all tokens
      user.password = hashedPassword;
      user.lastPasswordChangeAt = new Date();
      user.refreshTokenHash = null;
      
      await queryRunner.manager.save(user);

      // Log password reset
      await this.logAudit(
        queryRunner,
        user.id,
        'PASSWORD_RESET',
        'Password reset successfully',
      );

      // Send confirmation email
      await this.notificationService.sendPasswordResetConfirmation(
        user.email,
        user.firstName,
      );

      // Emit event
      this.eventEmitter.emit('user.password_reset', { userId: user.id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Reset token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid reset token');
      }
      
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { emailVerificationToken: verifyEmailDto.token },
      });

      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }

      // Check if token is expired
      if (
        user.emailVerificationTokenExpiry &&
        isBefore(new Date(user.emailVerificationTokenExpiry), new Date())
      ) {
        // Generate new token
        const newToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = newToken;
        user.emailVerificationTokenExpiry = addDays(new Date(), 1);
        
        await queryRunner.manager.save(user);

        // Resend verification email
        await this.notificationService.sendVerificationEmail(
          user.email,
          user.firstName,
          newToken,
        );

        throw new BadRequestException('Verification token has expired. A new token has been sent.');
      }

      // Verify email
      user.verifyEmail();
      user.emailVerificationToken = null;
      user.emailVerificationTokenExpiry = null;
      
      // If this was pending registration, activate account
      if (user.accountStatus === AccountStatus.PENDING) {
        user.accountStatus = AccountStatus.ACTIVE;
      }

      await queryRunner.manager.save(user);

      // Log email verification
      await this.logAudit(
        queryRunner,
        user.id,
        'EMAIL_VERIFIED',
        'Email verified successfully',
      );

      // Send welcome email (if first verification)
      await this.notificationService.sendEmailVerifiedNotification(
        user.email,
        user.firstName,
      );

      // Emit event
      this.eventEmitter.emit('user.email_verified', { userId: user.id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyPhone(verifyPhoneDto: VerifyPhoneDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { phoneNumber: verifyPhoneDto.phoneNumber },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify code
      if (
        !user.phoneVerificationCode ||
        !user.phoneVerificationCodeExpiry
      ) {
        throw new BadRequestException('No verification code found');
      }

      // Check if code is expired
      if (isBefore(new Date(user.phoneVerificationCodeExpiry), new Date())) {
        throw new BadRequestException('Verification code has expired');
      }

      // Verify code
      const isValid = await bcrypt.compare(
        verifyPhoneDto.code,
        user.phoneVerificationCode,
      );

      if (!isValid) {
        throw new BadRequestException('Invalid verification code');
      }

      // Verify phone
      user.verifyPhone();
      user.phoneVerificationCode = null;
      user.phoneVerificationCodeExpiry = null;
      
      await queryRunner.manager.save(user);

      // Log phone verification
      await this.logAudit(
        queryRunner,
        user.id,
        'PHONE_VERIFIED',
        'Phone number verified successfully',
      );

      // Send notification
      await this.notificationService.sendPhoneVerifiedNotification(
        user.phoneNumber,
      );

      // Emit event
      this.eventEmitter.emit('user.phone_verified', { userId: user.id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if user exists
        return;
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      // Generate new token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = addDays(new Date(), 1);

      user.emailVerificationToken = verificationToken;
      user.emailVerificationTokenExpiry = verificationTokenExpiry;
      
      await this.userRepository.save(user);

      // Send verification email
      await this.notificationService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken,
      );

      // Log resend
      await this.logAuditDirect(
        user.id,
        'VERIFICATION_EMAIL_RESENT',
        'Verification email resent',
      );
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw new InternalServerErrorException('Failed to resend verification email');
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.validateAccountStatus(user);

    return user;
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'password' | 'refreshTokenHash'>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'kyc'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, refreshTokenHash, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData as Omit<User, 'password' | 'refreshTokenHash'>;
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
      verificationStatus: user.verificationStatus,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      issuer: 'moneycircle-api',
      audience: 'moneycircle-web',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        issuer: 'moneycircle-api',
        audience: 'moneycircle-web',
      },
    );

    // Parse expiresIn to seconds
    const accessExpiresIn = this.parseExpiresIn(
      this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default to 15 minutes in seconds
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  private validateAccountStatus(user: User): void {
    switch (user.accountStatus) {
      case AccountStatus.SUSPENDED:
        throw new ForbiddenException(
          `Account is suspended. Reason: ${user.deactivationReason || 'Contact support'}`,
        );
      case AccountStatus.DEACTIVATED:
        throw new ForbiddenException(
          `Account is deactivated. Reason: ${user.deactivationReason || 'Contact support'}`,
        );
      case AccountStatus.UNDER_REVIEW:
        throw new ForbiddenException('Account is under review. Please contact support.');
      case AccountStatus.REJECTED:
        throw new ForbiddenException(
          `Account application was rejected. Reason: ${user.deactivationReason || 'Contact support'}`,
        );
      case AccountStatus.PENDING:
        if (!user.isEmailVerified) {
          throw new ForbiddenException('Please verify your email to activate your account');
        }
        break;
      case AccountStatus.ACTIVE:
        // Account is active, proceed
        break;
      default:
        throw new ForbiddenException('Account status is invalid');
    }
  }

  private isPasswordExpired(user: User): boolean {
    if (!user.lastPasswordChangeAt) {
      return false;
    }

    const passwordMaxAge = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    const now = new Date();
    const passwordAge = now.getTime() - user.lastPasswordChangeAt.getTime();

    return passwordAge > passwordMaxAge;
  }

  private canResetPassword(user: User): boolean {
    return (
      user.accountStatus === AccountStatus.ACTIVE ||
      user.accountStatus === AccountStatus.PENDING
    );
  }

  private async logAudit(
    queryRunner: any,
    userId: string,
    action: string,
    details: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog = queryRunner.manager.create(AuditLog, {
      id: uuidv4(),
      userId,
      action,
      details,
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'CLI/1.0',
      timestamp: new Date(),
    });

    await queryRunner.manager.save(auditLog);
  }

  private async logAuditDirect(
    userId: string,
    action: string,
    details: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      id: uuidv4(),
      userId,
      action,
      details,
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'CLI/1.0',
      timestamp: new Date(),
    });

    await this.auditLogRepository.save(auditLog);
  }
}