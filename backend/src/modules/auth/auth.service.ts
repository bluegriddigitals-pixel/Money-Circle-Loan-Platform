import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, AccountStatus } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { Wallet } from '../payment/entities/wallet.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profilesRepository: Repository<UserProfile>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; tokens: any }> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: registerDto.email }, { phoneNumber: registerDto.phoneNumber }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.usersRepository.create({
      ...registerDto,
      passwordHash: hashedPassword,
      status: AccountStatus.PENDING,
    });

    // Create user profile
    const profile = this.profilesRepository.create({
      user,
    });

    // Create wallet
    const wallet = this.walletsRepository.create({
      user,
      availableBalance: 0,
      lockedBalance: 0,
    });

    // Save all in transaction
    await this.usersRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(user);
      profile.userId = user.id;
      await transactionalEntityManager.save(profile);
      await transactionalEntityManager.save(wallet);
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update last login
    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    return { user, tokens };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; tokens: any }> {
    // Find user
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      relations: ['profile', 'wallet'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check account status
    if (user.status !== AccountStatus.ACTIVE && user.status !== AccountStatus.PENDING) {
      throw new ForbiddenException(`Account is ${user.status}`);
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await this.usersRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.accessTokenExpiry'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.refreshTokenExpiry'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('jwt.secret'),
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // In a real application, you would invalidate the refresh token
    // This could be done by storing it in a Redis blacklist
    return { message: 'Logged out successfully' };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'wallet'],
    });

    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}