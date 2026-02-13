import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import {
  addDays,
  addMinutes,
  addHours,
  isBefore,
  differenceInMinutes,
} from 'date-fns';
import { Request } from 'express';
import { createHash } from 'crypto';

import { User, UserRole, AccountStatus, VerificationStatus } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EnableTwoFactorDto } from './dto/enable-two-factor.dto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { AccessLog } from '../audit/entities/access-log.entity';
import { NotificationService } from '../notification/notification.service';
import { RiskService } from '../risk/risk.service';
import { ComplianceService } from '../compliance/compliance.service';
import { MailerService } from '../../shared/mailer/mailer.service';
import { SmsService } from '../../shared/sms/sms.service';
import { RateLimiterService } from '../../shared/security/rate-limiter.service';
import { IpBlockerService } from '../../shared/security/ip-blocker.service';
import { DeviceFingerprintService } from '../../shared/security/device-fingerprint.service';
import { EncryptionService } from '../../shared/security/encryption.service';
import { SessionService } from './session.service';
import { UserService } from '../user/user.service';
import { AuditSeverity } from '../audit/entities/audit-log.entity';
import { AccessSeverity } from '../audit/entities/access-log.entity';
import { RiskLevel } from '../user/entities/user-profile.entity';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  kycStatus: KycStatus;
  verificationStatus: VerificationStatus;
  twoFactorEnabled: boolean;
  sessionId: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

interface LoginResponse {
  user: Omit<User, 'password' | 'refreshTokenHash' | 'twoFactorSecret' | 'backupCodes'>;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    scope: string[];
  } | null;
  requiresTwoFactor: boolean;
  twoFactorMethods?: string[];
  challengeId?: string;
  expiresIn?: number;
}

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface ClientInfo {
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

@Injectable()
export class AuthService {
  private readonly refreshTokenBlacklist = new Set<string>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(AccessLog)
    private readonly accessLogRepository: Repository<AccessLog>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => RiskService))
    private readonly riskService: RiskService,
    @Inject(forwardRef(() => ComplianceService))
    private readonly complianceService: ComplianceService,
    private readonly mailerService: MailerService,
    private readonly smsService: SmsService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly ipBlockerService: IpBlockerService,
    private readonly deviceFingerprintService: DeviceFingerprintService,
    private readonly encryptionService: EncryptionService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
  ) { }

  private get saltRounds(): number {
    return this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
  }

  private get maxLoginAttempts(): number {
    return this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
  }

  private get lockoutDuration(): number {
    return this.configService.get<number>('LOCKOUT_DURATION_MINUTES', 15);
  }

  private get passwordHistorySize(): number {
    return this.configService.get<number>('PASSWORD_HISTORY_SIZE', 5);
  }

  private get sessionTimeout(): number {
    return this.configService.get<number>('SESSION_TIMEOUT_MINUTES', 30);
  }

  async register(registerDto: RegisterDto, request?: Request): Promise<LoginResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    const ipAddress = request?.ip || '127.0.0.1';
    const userAgent = request?.headers['user-agent'] || 'Unknown';
    const deviceFingerprint = await this.deviceFingerprintService.generateFingerprint(request);

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Rate limiting check
      await this.rateLimiterService.checkLimit(`register:${ipAddress}`, 5, 3600);

      // IP blocking check
      await this.ipBlockerService.checkIp(ipAddress);

      // Validate registration data
      await this.validateRegistrationData(registerDto);

      // Check if user already exists
      const existingUser = await this.checkExistingUser(registerDto);
      if (existingUser.exists) {
        throw new ConflictException(existingUser.message);
      }

      // Validate age requirement
      this.validateAgeRequirement(registerDto.dateOfBirth);

      // Hash password with advanced security
      const hashedPassword = await this.hashPassword(registerDto.password);

      // Generate secure tokens and codes
      const emailVerificationToken = this.generateSecureToken();
      const emailVerificationTokenExpiry = addDays(new Date(), 1);
      const phoneVerificationCode = this.generateVerificationCode();
      const phoneVerificationCodeExpiry = addMinutes(new Date(), 15);

      // Create user with comprehensive data
      const user = queryRunner.manager.create(User, {
        email: registerDto.email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: this.sanitizeInput(registerDto.firstName),
        lastName: this.sanitizeInput(registerDto.lastName),
        phoneNumber: registerDto.phoneNumber ? this.normalizePhoneNumber(registerDto.phoneNumber) : null,
        dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null,
        role: registerDto.role || UserRole.BORROWER,
        accountStatus: AccountStatus.PENDING_VERIFICATION,
        kycStatus: KycStatus.NOT_STARTED,
        verificationStatus: VerificationStatus.UNVERIFIED,
        emailVerificationToken: await this.encryptionService.hash(emailVerificationToken),
        emailVerificationTokenExpiry,
        phoneVerificationCode: registerDto.phoneNumber ? await this.encryptionService.hash(phoneVerificationCode) : null,
        phoneVerificationCodeExpiry: registerDto.phoneNumber ? phoneVerificationCodeExpiry : null,
        registrationIp: ipAddress,
        registrationUserAgent: userAgent,
        registrationDeviceFingerprint: deviceFingerprint,
        acceptedTermsVersion: registerDto.termsVersion || '1.0.0',
        acceptedPrivacyVersion: registerDto.privacyVersion || '1.0.0',
        marketingConsent: registerDto.marketingConsent || false,
        dataProcessingConsent: registerDto.dataProcessingConsent || false,
        lastPasswordChangeAt: new Date(),
        passwordHistory: [await this.encryptionService.hash(hashedPassword)],
      });

      // Handle security questions if provided
      if (registerDto.securityQuestions && registerDto.securityQuestions.length > 0) {
        user.securityQuestions = await this.encryptSecurityQuestions(registerDto.securityQuestions);
      }

      const savedUser = await queryRunner.manager.save(user);

      // Create comprehensive user profile with initial risk assessment
      const initialRiskAssessment = await this.riskService.performInitialRiskAssessment(savedUser, registerDto);
      const creditScore = await this.riskService.calculateInitialCreditScore(savedUser, registerDto);

      const userProfile = queryRunner.manager.create(UserProfile, {
        user: savedUser,
        riskLevel: RiskLevel[initialRiskAssessment.riskLevel] || RiskLevel.LOW,
        creditScore,
        totalLoanAmount: 0,
        totalRepaidAmount: 0,
        activeLoansCount: 0,
        completedLoansCount: 0,
        defaultedLoansCount: 0,
        totalInvestedAmount: 0,
        totalReturns: 0,
        averageReturnRate: 0,
        riskFactors: initialRiskAssessment.factors,
        behavioralPatterns: {},
        financialBehaviorScore: 500,
        repaymentConsistencyScore: 0,
        investmentRiskTolerance: 'MODERATE',
        preferredLoanTypes: [],
        preferredInvestmentTypes: [],
        notificationPreferences: {
          email: true,
          sms: registerDto.phoneNumber ? true : false,
          push: false,
          marketing: registerDto.marketingConsent || false,
        },
        privacySettings: {
          profileVisibility: 'PRIVATE',
          activityVisibility: 'FRIENDS_ONLY',
          searchVisibility: true,
        },
        securitySettings: {
          twoFactorEnabled: false,
          biometricEnabled: false,
          sessionTimeout: this.sessionTimeout,
          loginAlerts: true,
          unusualActivityAlerts: true,
        },
      });

      await queryRunner.manager.save(userProfile);

      // Generate initial session and tokens
      const session = await this.sessionService.createSession(
        savedUser.id,
        ipAddress,
        userAgent,
        deviceFingerprint,
      );

      const tokens = await this.generateTokens(savedUser, session.id);

      // Save refresh token securely
      const refreshTokenHash = await this.encryptionService.hash(tokens.refreshToken);
      savedUser.refreshTokenHash = refreshTokenHash;
      await queryRunner.manager.save(savedUser);

      // Initialize compliance checks
      await this.complianceService.initializeUserCompliance(savedUser.id);

      // Log registration
      await this.logAudit(
        queryRunner,
        savedUser.id,
        'USER_REGISTERED',
        `User registered with role: ${savedUser.role}. IP: ${ipAddress}, Device: ${deviceFingerprint}`,
        ipAddress,
        userAgent,
        AuditSeverity.HIGH,
      );

      // Send comprehensive notifications
      await this.sendRegistrationNotifications(
        savedUser,
        emailVerificationToken,
        phoneVerificationCode,
        ipAddress,
      );

      // Emit registration event
      this.eventEmitter.emit('user.registered', {
        userId: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        ipAddress,
        timestamp: new Date(),
      });

      // Track analytics
      this.eventEmitter.emit('analytics.user_registered', {
        userId: savedUser.id,
        source: registerDto.source || 'direct',
        campaign: registerDto.campaign,
        medium: registerDto.medium,
        referralCode: registerDto.referralCode,
      });

      await queryRunner.commitTransaction();

      // Return response
      return this.buildLoginResponse(savedUser, tokens, false);

    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Log registration failure
      await this.logAuditDirect(
        null,
        'REGISTRATION_FAILED',
        `Registration failed for email: ${registerDto.email}. Error: ${error.message}`,
        ipAddress,
        userAgent,
        AuditSeverity.HIGH,  // <-- Fixed
      );

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      console.error('Registration error:', error);
      throw new InternalServerErrorException('Failed to complete registration. Please try again.');
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto, request?: Request): Promise<LoginResponse> {
    const ipAddress = request?.ip || '127.0.0.1';
    const userAgent = request?.headers['user-agent'] || 'Unknown';
    const deviceFingerprint = await this.deviceFingerprintService.generateFingerprint(request);

    try {
      // Rate limiting check
      await this.rateLimiterService.checkLimit(`login:${ipAddress}`, 10, 900);

      // IP blocking check
      await this.ipBlockerService.checkIp(ipAddress);

      // Find user with all relations
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email.toLowerCase().trim() },
        relations: ['profile'],
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'role',
          'accountStatus', 'kycStatus', 'verificationStatus', 'twoFactorSecret',
          'isTwoFactorEnabled', 'lastLoginAt', 'failedLoginAttempts',
          'accountLockedUntil', 'refreshTokenHash', 'backupCodes'],
      });

      if (!user) {
        // Log failed attempt for non-existent user
        await this.logFailedLoginAttempt(null, ipAddress, userAgent, 'USER_NOT_FOUND');
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if account is locked
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        const minutesLeft = differenceInMinutes(user.accountLockedUntil, new Date());
        throw new ForbiddenException(
          `Account is locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`
        );
      }

      // Check account status
      this.validateAccountStatus(user);

      // Verify password with timing-safe comparison
      const isPasswordValid = await this.verifyPassword(loginDto.password, user.password);

      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.handleFailedLoginAttempt(user, ipAddress, userAgent);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Reset failed login attempts
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;

      // Check if password needs to be changed
      if (this.isPasswordExpired(user)) {
        throw new ForbiddenException(
          'Your password has expired. Please reset your password to continue.'
        );
      }

      // Check for suspicious activity
      await this.checkSuspiciousActivity(user, ipAddress, deviceFingerprint);

      // Create new session
      const session = await this.sessionService.createSession(
        user.id,
        ipAddress,
        userAgent,
        deviceFingerprint,
      );

      // Update user activity
      user.lastLoginAt = new Date();
      user.lastActivityAt = new Date();
      user.lastLoginIp = ipAddress;
      user.lastLoginDevice = deviceFingerprint;
      await this.userRepository.save(user);

      // Generate tokens
      const tokens = await this.generateTokens(user, session.id);

      // Save refresh token hash
      const refreshTokenHash = await this.encryptionService.hash(tokens.refreshToken);
      user.refreshTokenHash = refreshTokenHash;
      await this.userRepository.save(user);

      // Log successful login
      await this.logAuditDirect(
        user.id,
        'LOGIN_SUCCESS',
        `User logged in successfully from IP: ${ipAddress}, Device: ${deviceFingerprint}`,
        ipAddress,
        userAgent,
        AuditSeverity.MEDIUM,
      );

      // Emit login event
      this.eventEmitter.emit('user.logged_in', {
        userId: user.id,
        email: user.email,
        ipAddress,
        userAgent,
        deviceFingerprint,
        timestamp: new Date(),
      });

      // Check if 2FA is required
      const requiresTwoFactor = user.isTwoFactorEnabled;
      const twoFactorMethods = user.isTwoFactorEnabled ? ['authenticator', 'sms', 'email'] : [];

      if (requiresTwoFactor) {
        // Generate 2FA challenge
        const challenge = await this.generateTwoFactorChallenge(user, ipAddress);

        return {
          user: this.sanitizeUserForResponse(user),
          tokens: null,
          requiresTwoFactor: true,
          twoFactorMethods,
          challengeId: challenge.challengeId,
          expiresIn: challenge.expiresIn,
        };
      }

      return this.buildLoginResponse(user, tokens, false);

    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      console.error('Login error:', error);
      throw new InternalServerErrorException('Failed to process login request');
    }
  }

  async verifyTwoFactor(verifyTwoFactorDto: VerifyTwoFactorDto, request?: Request): Promise<LoginResponse> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      // Find user by 2FA session
      const user = await this.userRepository.findOne({
        where: { id: verifyTwoFactorDto.userId },
        relations: ['profile'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid 2FA session');
      }

      // Verify 2FA code
      const isValid = await this.verifyTwoFactorCode(
        user,
        verifyTwoFactorDto.code,
        verifyTwoFactorDto.method,
      );

      if (!isValid) {
        await this.logAuditDirect(
          user.id,
          '2FA_FAILED',
          `Failed 2FA verification attempt from IP: ${ipAddress}`,
          ipAddress,
          null,
          AuditSeverity.HIGH,  // <-- Fixed
        );
        throw new UnauthorizedException('Invalid verification code');
      }

      // Create session
      const session = await this.sessionService.createSession(
        user.id,
        ipAddress,
        request?.headers['user-agent'] || 'Unknown',
        await this.deviceFingerprintService.generateFingerprint(request),
      );

      // Generate tokens
      const tokens = await this.generateTokens(user, session.id);

      // Log successful 2FA
      await this.logAuditDirect(
        user.id,
        '2FA_SUCCESS',
        `2FA verification successful from IP: ${ipAddress}`,
        ipAddress,
        null,
        AuditSeverity.MEDIUM,  // <-- Fixed
      );

      return this.buildLoginResponse(user, tokens, false);

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('2FA verification error:', error);
      throw new InternalServerErrorException('Failed to verify 2FA');
    }
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto, request?: Request): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    scope: string[];
  }> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        ignoreExpiration: false,
      }) as TokenPayload;

      // Check token blacklist
      const tokenHash = createHash('sha256').update(refreshTokenDto.refreshToken).digest('hex');
      if (this.refreshTokenBlacklist.has(tokenHash)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify refresh token matches stored hash
      const isValid = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.refreshTokenHash,
      );

      if (!isValid) {
        // Possible token theft - invalidate all sessions
        await this.sessionService.invalidateAllUserSessions(user.id);
        user.refreshTokenHash = null;
        await this.userRepository.save(user);

        await this.logAuditDirect(
          user.id,
          'REFRESH_TOKEN_THEFT',
          'Possible refresh token theft detected',
          ipAddress,
          null,
          AuditSeverity.CRITICAL,  // <-- Fixed
        );

        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check account status
      this.validateAccountStatus(user);

      // Generate new session
      const session = await this.sessionService.refreshSession(
        payload.sessionId,
        ipAddress,
      );

      // Generate new tokens
      const tokens = await this.generateTokens(user, session.id);

      // Update refresh token hash
      const newRefreshTokenHash = await bcrypt.hash(
        tokens.refreshToken,
        this.saltRounds,
      );
      user.refreshTokenHash = newRefreshTokenHash;
      user.lastActivityAt = new Date();
      await this.userRepository.save(user);

      // Blacklist old refresh token
      this.refreshTokenBlacklist.add(tokenHash);

      // Log token refresh
      await this.logAuditDirect(
        user.id,
        'TOKENS_REFRESHED',
        'Access tokens refreshed successfully',
        ipAddress,
        null,
        AuditSeverity.LOW,  // <-- Fixed
      );

      return {
        ...tokens,
        tokenType: 'Bearer',
        scope: ['openid', 'profile', 'email'],
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

  async logout(userId: string, request?: Request): Promise<void> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      // Invalidate current session
      const sessionId = request?.headers['x-session-id'] as string;
      if (sessionId) {
        await this.sessionService.invalidateSession(sessionId);
      }

      // Clear refresh token
      await this.userRepository.update(userId, {
        refreshTokenHash: null,
        lastActivityAt: new Date(),
      });

      // Log logout
      await this.logAuditDirect(
        userId,
        'LOGOUT',
        'User logged out successfully',
        ipAddress,
        null,
        AuditSeverity.LOW,
      );

      // Emit event
      this.eventEmitter.emit('user.logged_out', { userId, timestamp: new Date() });

    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout failures
    }
  }

  async logoutAll(userId: string, request?: Request): Promise<void> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      // Invalidate all user sessions
      await this.sessionService.invalidateAllUserSessions(userId);

      // Clear refresh token
      await this.userRepository.update(userId, {
        refreshTokenHash: null,
        lastActivityAt: new Date(),
      });

      // Log logout all
      await this.logAuditDirect(
        userId,
        'LOGOUT_ALL',
        'User logged out from all devices',
        ipAddress,
        null,
        AuditSeverity.MEDIUM,
      );

      // Send notification
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        await this.notificationService.sendSecurityAlert(
          user.email,
          ipAddress
        );
      }

    } catch (error) {
      console.error('Logout all error:', error);
      throw new InternalServerErrorException('Failed to logout from all devices');
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    request?: Request,
  ): Promise<void> {
    const ipAddress = request?.ip || '127.0.0.1';
    const userAgent = request?.headers['user-agent'] || 'Unknown';

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        select: ['id', 'password', 'passwordHistory', 'email', 'firstName'],
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

      // Check password complexity
      this.validatePasswordComplexity(changePasswordDto.newPassword);

      // Check against password history
      await this.checkPasswordHistory(user, changePasswordDto.newPassword);

      // Hash new password
      const hashedPassword = await this.hashPassword(changePasswordDto.newPassword);

      // Update password and invalidate all tokens
      user.password = hashedPassword;
      user.lastPasswordChangeAt = new Date();
      user.refreshTokenHash = null;

      // Update password history
      const passwordHash = await this.encryptionService.hash(hashedPassword);
      user.passwordHistory = [
        passwordHash,
        ...(user.passwordHistory || []).slice(0, this.passwordHistorySize - 1),
      ];

      await queryRunner.manager.save(user);

      // Invalidate all sessions
      await this.sessionService.invalidateAllUserSessions(userId);

      // Log password change
      await this.logAudit(
        queryRunner,
        userId,
        'PASSWORD_CHANGED',
        'Password changed successfully',
        ipAddress,
        userAgent,
        AuditSeverity.HIGH,
      );

      // Send notification
      await this.notificationService.sendPasswordChangeNotification(
        user.email,
        ipAddress
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

  async requestPasswordReset(resetPasswordRequestDto: ResetPasswordRequestDto): Promise<{ resetToken: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: resetPasswordRequestDto.email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if user exists (security best practice)
        // But still implement rate limiting
        await this.rateLimiterService.checkLimit(
          `reset_request:${resetPasswordRequestDto.email}`,
          3,
          3600,
        );
        return { resetToken: 'dummy_token_for_security' };
      }

      // Check if user can reset password
      if (!this.canResetPassword(user)) {
        throw new ForbiddenException('Account is not eligible for password reset');
      }

      // Rate limiting per user
      await this.rateLimiterService.checkLimit(
        `reset_request_user:${user.id}`,
        3,
        3600,
      );

      // Generate secure reset token
      const resetToken = this.jwtService.sign(
        {
          sub: user.id,
          type: 'password_reset',
          jti: uuidv4(),
          iat: Math.floor(Date.now() / 1000),
        },
        {
          secret: this.configService.get('JWT_RESET_SECRET'),
          expiresIn: '1h',
          issuer: 'moneycircle-api',
          audience: 'moneycircle-web',
        },
      );

      // Store reset token with expiry
      const resetTokenHash = await this.encryptionService.hash(resetToken);
      user.passwordResetToken = resetTokenHash;
      user.passwordResetTokenExpiry = addHours(new Date(), 1);
      await this.userRepository.save(user);

      // Send reset email with security context
      await this.notificationService.sendPasswordResetConfirmation(
        user.email
      );

      // Log reset request
      await this.logAuditDirect(
        user.id,
        'PASSWORD_RESET_REQUESTED',
        'Password reset requested',
        resetPasswordRequestDto.clientInfo?.ipAddress,
        resetPasswordRequestDto.clientInfo?.userAgent,
        AuditSeverity.MEDIUM,
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
      }) as { sub: string; type: string; jti: string; iat: number };

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: payload.sub },
        select: ['id', 'password', 'passwordResetToken', 'passwordResetTokenExpiry', 'email', 'firstName'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify reset token matches stored token
      if (!user.passwordResetToken || !user.passwordResetTokenExpiry) {
        throw new BadRequestException('No active reset token found');
      }

      const isValidToken = await bcrypt.compare(
        resetPasswordDto.token,
        user.passwordResetToken,
      );

      if (!isValidToken) {
        throw new BadRequestException('Invalid reset token');
      }

      // Check if token is expired
      if (user.passwordResetTokenExpiry < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }

      // Check if new password is same as old password
      const isSameAsOld = user.password ? await bcrypt.compare(
        resetPasswordDto.newPassword,
        user.password,
      ) : false;

      if (isSameAsOld) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Check password complexity
      this.validatePasswordComplexity(resetPasswordDto.newPassword);

      // Hash new password
      const hashedPassword = await this.hashPassword(resetPasswordDto.newPassword);

      // Update password and clear all tokens
      user.password = hashedPassword;
      user.lastPasswordChangeAt = new Date();
      user.refreshTokenHash = null;
      user.passwordResetToken = null;
      user.passwordResetTokenExpiry = null;
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;

      // Update password history
      const passwordHash = await this.encryptionService.hash(hashedPassword);
      user.passwordHistory = [
        passwordHash,
        ...(user.passwordHistory || []).slice(0, this.passwordHistorySize - 1),
      ];

      await queryRunner.manager.save(user);

      // Invalidate all sessions
      await this.sessionService.invalidateAllUserSessions(user.id);

      // Log password reset
      await this.logAudit(
        queryRunner,
        user.id,
        'PASSWORD_RESET',
        'Password reset successfully',
        resetPasswordDto.clientInfo?.ipAddress,
        resetPasswordDto.clientInfo?.userAgent,
        AuditSeverity.HIGH,  // <-- Fixed
      );

      // Send confirmation email
      await this.notificationService.sendPasswordResetConfirmation(
        user.email,
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
      // Find user by verification token
      const users = await queryRunner.manager.find(User, {
        where: { emailVerificationToken: Not(IsNull()) },
        select: ['id', 'emailVerificationToken', 'emailVerificationTokenExpiry', 'email', 'firstName', 'verificationStatus'],
      });

      let targetUser: User = null;
      for (const user of users) {
        if (user.emailVerificationToken &&
          await bcrypt.compare(verifyEmailDto.token, user.emailVerificationToken)) {
          targetUser = user;
          break;
        }
      }

      if (!targetUser) {
        throw new BadRequestException('Invalid verification token');
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: targetUser.id },
      });

      // Check if token is expired
      if (
        user.emailVerificationTokenExpiry &&
        isBefore(new Date(user.emailVerificationTokenExpiry), new Date())
      ) {
        // Generate new token
        const newToken = this.generateSecureToken();
        user.emailVerificationToken = await this.encryptionService.hash(newToken);
        user.emailVerificationTokenExpiry = addDays(new Date(), 1);

        await queryRunner.manager.save(user);

        // Resend verification email
        await this.notificationService.sendVerificationEmail(
          user.email
        );

        throw new BadRequestException('Verification token has expired. A new token has been sent to your email.');
      }

      // Verify email
      user.verifyEmail();
      user.emailVerificationToken = null;
      user.emailVerificationTokenExpiry = null;

      // If this was pending registration, update account status
      if (user.accountStatus === AccountStatus.PENDING_VERIFICATION) {
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
      );

      // Initialize user account
      await this.userService.initializeUserAccount(user.id);

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
        select: ['id', 'phoneVerificationCode', 'phoneVerificationCodeExpiry', 'phoneNumber', 'verificationStatus'],
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

  async resendVerificationEmail(email: string, request?: Request): Promise<void> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      // Rate limiting
      await this.rateLimiterService.checkLimit(`resend_verification:${email}`, 3, 3600);

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
      const verificationToken = this.generateSecureToken();
      const verificationTokenExpiry = addDays(new Date(), 1);

      user.emailVerificationToken = await this.encryptionService.hash(verificationToken);
      user.emailVerificationTokenExpiry = verificationTokenExpiry;

      await this.userRepository.save(user);

      // Send verification email
      await this.notificationService.sendVerificationEmail(
        user.email,
      );

      // Log resend
      await this.logAuditDirect(
        user.id,
        'VERIFICATION_EMAIL_RESENT',
        'Verification email resent',
        ipAddress,
        null,
        AuditSeverity.LOW,  // <-- Fixed
      );
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw new InternalServerErrorException('Failed to resend verification email');
    }
  }

  async enableTwoFactor(
    userId: string,
    enableTwoFactorDto: EnableTwoFactorDto,
    request?: Request,
  ): Promise<TwoFactorSetup> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isTwoFactorEnabled) {
        throw new BadRequestException('Two-factor authentication is already enabled');
      }

      // Generate 2FA secret
      const secret = this.generateTwoFactorSecret();
      const qrCode = await this.generateQrCode(user.email, secret);
      const backupCodes = this.generateBackupCodes();

      // Store encrypted secret and backup codes
      user.twoFactorSecret = await this.encryptionService.encrypt(secret);
      user.backupCodes = await this.encryptionService.encrypt(JSON.stringify(backupCodes)) as string;
      user.isTwoFactorEnabled = false; // Will be enabled after verification

      await this.userRepository.save(user);

      // Log 2FA setup initiation
      await this.logAuditDirect(
        user.id,
        '2FA_SETUP_INITIATED',
        'Two-factor authentication setup initiated',
        ipAddress,
        null,
        AuditSeverity.HIGH,  // <-- Fixed
      );

      return {
        secret,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw new InternalServerErrorException('Failed to setup two-factor authentication');
    }
  }

  async verifyAndEnableTwoFactor(
    userId: string,
    verifyTwoFactorDto: VerifyTwoFactorDto,
    request?: Request,
  ): Promise<void> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.twoFactorSecret) {
        throw new BadRequestException('Two-factor authentication not set up');
      }

      // Decrypt and verify 2FA code
      const secret = await this.encryptionService.decrypt(user.twoFactorSecret);
      const isValid = this.verifyTwoFactorToken(secret, verifyTwoFactorDto.code);

      if (!isValid) {
        // Check backup codes
        if (user.backupCodes) {
          const backupCodes = JSON.parse(await this.encryptionService.decrypt(user.backupCodes));
          const backupIndex = backupCodes.findIndex(code => code === verifyTwoFactorDto.code);

          if (backupIndex !== -1) {
            // Remove used backup code
            backupCodes.splice(backupIndex, 1);
            user.backupCodes = await this.encryptionService.encrypt(JSON.stringify(backupCodes));
          } else {
            throw new UnauthorizedException('Invalid verification code');
          }
        } else {
          throw new UnauthorizedException('Invalid verification code');
        }
      }

      // Enable 2FA
      user.isTwoFactorEnabled = true;
      await this.userRepository.save(user);

      // Log 2FA enabled
      await this.logAuditDirect(
        user.id,
        '2FA_ENABLED',
        'Two-factor authentication enabled successfully',
        ipAddress,
        null,
        AuditSeverity.HIGH,  // <-- Fixed
      );

      // Send notification
      await this.notificationService.sendTwoFactorEnabledNotification(
        user.email,
        ipAddress
      );

    } catch (error) {
      console.error('Verify and enable 2FA error:', error);
      throw new InternalServerErrorException('Failed to enable two-factor authentication');
    }
  }

  async disableTwoFactor(userId: string, request?: Request): Promise<void> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.isTwoFactorEnabled) {
        throw new BadRequestException('Two-factor authentication is not enabled');
      }

      // Disable 2FA
      user.isTwoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.backupCodes = null;

      await this.userRepository.save(user);

      // Log 2FA disabled
      // Change to:
      await this.logAuditDirect(
        user.id,
        '2FA_DISABLED',
        'Two-factor authentication disabled',
        ipAddress,
        null,
        AuditSeverity.HIGH,  // <-- Fixed
      );

      // Send notification
      await this.notificationService.sendTwoFactorDisabledNotification(
        user.email,
        ipAddress
      );

    } catch (error) {
      console.error('Disable 2FA error:', error);
      throw new InternalServerErrorException('Failed to disable two-factor authentication');
    }
  }

  async regenerateBackupCodes(userId: string, request?: Request): Promise<string[]> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.isTwoFactorEnabled) {
        throw new BadRequestException('Two-factor authentication is not enabled');
      }

      // Generate new backup codes
      const backupCodes = this.generateBackupCodes();
      user.backupCodes = await this.encryptionService.encrypt(JSON.stringify(backupCodes));

      await this.userRepository.save(user);

      // Log backup codes regeneration
      await this.logAuditDirect(
        user.id,
        'BACKUP_CODES_REGENERATED',
        'Two-factor backup codes regenerated',
        ipAddress,
        null,
        AuditSeverity.HIGH,  // <-- Fixed
      );

      return backupCodes;
    } catch (error) {
      console.error('Regenerate backup codes error:', error);
      throw new InternalServerErrorException('Failed to regenerate backup codes');
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

  async getCurrentUser(userId: string): Promise<Omit<User, 'password' | 'refreshTokenHash' | 'twoFactorSecret' | 'backupCodes'>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUserForResponse(user);
  }

  async getActiveSessions(userId: string): Promise<any[]> {
    return this.sessionService.getUserSessions(userId);
  }

  async terminateSession(userId: string, sessionId: string, request?: Request): Promise<void> {
    const ipAddress = request?.ip || '127.0.0.1';

    try {
      await this.sessionService.invalidateSession(sessionId);

      // Log session termination
      await this.logAuditDirect(
        userId,
        'SESSION_TERMINATED',
        `Session ${sessionId} terminated`,
        ipAddress,
        null,
        AuditSeverity.MEDIUM,  // <-- Fixed
      );
    } catch (error) {
      console.error('Terminate session error:', error);
      throw new InternalServerErrorException('Failed to terminate session');
    }
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    request?: Request,
  ): Promise<Omit<User, 'password' | 'refreshTokenHash' | 'twoFactorSecret' | 'backupCodes'>> {
    const ipAddress = request?.ip || '127.0.0.1';

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update basic profile information
      if (updateProfileDto.firstName !== undefined) {
        user.firstName = this.sanitizeInput(updateProfileDto.firstName);
      }
      if (updateProfileDto.lastName !== undefined) {
        user.lastName = this.sanitizeInput(updateProfileDto.lastName);
      }
      if (updateProfileDto.dateOfBirth !== undefined) {
        this.validateAgeRequirement(updateProfileDto.dateOfBirth);
        user.dateOfBirth = new Date(updateProfileDto.dateOfBirth);
      }

      // Update phone number (requires re-verification)
      if (updateProfileDto.phoneNumber !== undefined &&
        updateProfileDto.phoneNumber !== user.phoneNumber) {
        const phoneVerificationCode = this.generateVerificationCode();
        user.phoneNumber = this.normalizePhoneNumber(updateProfileDto.phoneNumber);
        user.phoneVerificationCode = await this.encryptionService.hash(phoneVerificationCode);
        user.phoneVerificationCodeExpiry = addMinutes(new Date(), 15);
        user.verificationStatus = user.isEmailVerified ?
          VerificationStatus.EMAIL_VERIFIED : VerificationStatus.UNVERIFIED;

        // Send verification SMS
        await this.smsService.sendVerificationCode(
          user.phoneNumber,
          phoneVerificationCode,
        );
      }

      // Update profile preferences
      if (user.profile && updateProfileDto.preferences) {
        if (updateProfileDto.preferences.notification) {
          user.profile.notificationPreferences = {
            ...user.profile.notificationPreferences,
            ...updateProfileDto.preferences.notification,
          };
        }
        if (updateProfileDto.preferences.privacy) {
          user.profile.privacySettings = {
            ...user.profile.privacySettings,
            ...updateProfileDto.preferences.privacy,
          };
        }
        if (updateProfileDto.preferences.security) {
          user.profile.securitySettings = {
            ...user.profile.securitySettings,
            ...updateProfileDto.preferences.security,
          };
        }
      }

      await queryRunner.manager.save([user, user.profile]);

      // Log profile update
      await this.logAudit(
        queryRunner,
        user.id,
        'PROFILE_UPDATED',
        'User profile updated',
        ipAddress,
        null,
        AuditSeverity.LOW,  // <-- Fixed
      );

      await queryRunner.commitTransaction();

      return this.sanitizeUserForResponse(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkAccountHealth(userId: string): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check verification status
    if (!user.isEmailVerified) {
      issues.push('Email not verified');
      recommendations.push('Verify your email address to access all features');
    }

    if (!user.isPhoneVerified && user.phoneNumber) {
      issues.push('Phone number not verified');
      recommendations.push('Verify your phone number for enhanced security');
    }

    // Check KYC status
    if (user.kycStatus !== KycStatus.VERIFIED) {
      issues.push('KYC not completed');
      recommendations.push('Complete KYC verification to increase loan limits');
    }

    // Check password age
    if (this.isPasswordExpired(user)) {
      issues.push('Password expired');
      recommendations.push('Change your password for security');
    }

    // Check 2FA
    if (!user.isTwoFactorEnabled) {
      issues.push('Two-factor authentication not enabled');
      recommendations.push('Enable two-factor authentication for enhanced security');
    }

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 2) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return {
      status,
      issues,
      recommendations,
    };
  }

  // Private helper methods
  private async generateTokens(user: User, sessionId: string): Promise<{
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
      twoFactorEnabled: user.isTwoFactorEnabled,
      sessionId,
      jti: uuidv4(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      issuer: 'moneycircle-api',
      audience: 'moneycircle-web',
      notBefore: 0,
      jwtid: payload.jti,
    });

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        type: 'refresh',
        sessionId,
        jti: uuidv4(),
      },
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
      return 900;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900;
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
      case AccountStatus.PENDING_VERIFICATION:
        if (!user.isEmailVerified) {
          throw new ForbiddenException('Please verify your email to activate your account');
        }
        break;
      case AccountStatus.ACTIVE:
        break;
      default:
        throw new ForbiddenException('Account status is invalid');
    }
  }

  private isPasswordExpired(user: User): boolean {
    if (!user.lastPasswordChangeAt) {
      return false;
    }

    const passwordMaxAge = this.configService.get<number>('PASSWORD_MAX_AGE_DAYS', 90) * 24 * 60 * 60 * 1000;
    const now = new Date();
    const passwordAge = now.getTime() - user.lastPasswordChangeAt.getTime();

    return passwordAge > passwordMaxAge;
  }

  private canResetPassword(user: User): boolean {
    return (
      user.accountStatus === AccountStatus.ACTIVE ||
      user.accountStatus === AccountStatus.PENDING_VERIFICATION
    );
  }

  private async logAudit(
    queryRunner: QueryRunner,
    userId: string,
    action: string,
    details: string,
    ipAddress?: string,
    userAgent?: string,
    severity: AuditSeverity = AuditSeverity.LOW,  // <-- Changed from string to enum
  ): Promise<void> {
    const auditLog = queryRunner.manager.create(AuditLog, {
      userId,
      action,
      details,
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'Unknown',
      severity,  // <-- Now using enum
      timestamp: new Date(),
    });

    await queryRunner.manager.save(auditLog);
  }

  private async logAuditDirect(
    userId: string | null,
    action: string,
    details: string,
    ipAddress?: string,
    userAgent?: string,
    severity: AuditSeverity = AuditSeverity.LOW,  // <-- Changed from string to enum
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      details,
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'Unknown',
      severity,  // <-- Now using enum
      timestamp: new Date(),
    });

    await this.auditLogRepository.save(auditLog);
  }

  private async logFailedLoginAttempt(
    userId: string | null,
    ipAddress: string,
    userAgent: string,
    reason: string,
  ): Promise<void> {
    const accessLog = this.accessLogRepository.create({
      userId,
      action: 'LOGIN_FAILED',
      details: `Failed login attempt: ${reason}`,
      ipAddress,
      userAgent,
      severity: AccessSeverity.HIGH,
      timestamp: new Date(),
    });

    await this.accessLogRepository.save(accessLog);
  }

  private async handleFailedLoginAttempt(user: User, ipAddress: string, userAgent: string): Promise<void> {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= this.maxLoginAttempts) {
      user.accountLockedUntil = addMinutes(new Date(), this.lockoutDuration);

      await this.notificationService.sendSecurityAlert(
        user.email,
        ipAddress
      );
    }

    await this.userRepository.save(user);

    await this.logFailedLoginAttempt(
      user.id,
      ipAddress,
      userAgent,
      `Attempt ${user.failedLoginAttempts}/${this.maxLoginAttempts}`,
    );
  }

  private async checkSuspiciousActivity(user: User, ipAddress: string, deviceFingerprint: string): Promise<void> {
    const isUnusualLocation = await this.ipBlockerService.isUnusualLocation(user.id, ipAddress);
    const isNewDevice = await this.deviceFingerprintService.isNewDevice(user.id, deviceFingerprint);

    if (isUnusualLocation || isNewDevice) {
      await this.notificationService.sendSuspiciousActivityAlert(
        user.email
      );

      await this.logAuditDirect(
        user.id,
        'SUSPICIOUS_ACTIVITY_DETECTED',
        `Suspicious login detected: ${isUnusualLocation ? 'Unusual location' : ''} ${isNewDevice ? 'New device' : ''}`,
        ipAddress,
        null,
        AuditSeverity.HIGH,  // <-- Fixed
      );
    }
  }

  private async validateRegistrationData(registerDto: RegisterDto): Promise<void> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    this.validatePasswordComplexity(registerDto.password);

    if (registerDto.phoneNumber) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(registerDto.phoneNumber.replace(/\s/g, ''))) {
        throw new BadRequestException('Invalid phone number format');
      }
    }

    if (!Object.values(UserRole).includes(registerDto.role)) {
      throw new BadRequestException('Invalid user role');
    }
  }

  private async checkExistingUser(registerDto: RegisterDto): Promise<{ exists: boolean; message: string }> {
    const existingByEmail = await this.userRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
      withDeleted: true,
    });

    if (existingByEmail) {
      return {
        exists: true,
        message: 'User with this email already exists',
      };
    }

    if (registerDto.phoneNumber) {
      const existingByPhone = await this.userRepository.findOne({
        where: { phoneNumber: this.normalizePhoneNumber(registerDto.phoneNumber) },
        withDeleted: true,
      });

      if (existingByPhone) {
        return {
          exists: true,
          message: 'User with this phone number already exists',
        };
      }
    }

    return { exists: false, message: '' };
  }

  private validateAgeRequirement(dateOfBirth: string): void {
    if (!dateOfBirth) return;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      throw new BadRequestException('You must be at least 18 years old to register');
    }

    if (age > 120) {
      throw new BadRequestException('Invalid date of birth');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  private async verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\s/g, '').replace(/^0/, '+');
  }

  private sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  private async encryptSecurityQuestions(questions: Array<{ question: string; answer: string }>): Promise<Array<{ question: string; answer: string; createdAt: Date }>> {
    return Promise.all(
      questions.map(async (q) => ({
        question: q.question,
        answer: await this.encryptionService.hash(q.answer.toLowerCase()),
        createdAt: new Date(),
      }))
    );
  }

  private async sendRegistrationNotifications(
    user: User,
    emailToken: string,
    phoneCode: string,
    ipAddress: string,
  ): Promise<void> {
    await this.mailerService.sendWelcomeEmail(
      user.email,
      user.firstName,
      emailToken,
      ipAddress,
    );

    if (user.phoneNumber && phoneCode) {
      await this.smsService.sendVerificationCode(user.phoneNumber, phoneCode);
    }

    await this.notificationService.sendNewUserNotification(user);
  }

  private buildLoginResponse(user: User, tokens: any, requiresTwoFactor: boolean): LoginResponse {
    return {
      user: this.sanitizeUserForResponse(user),
      tokens: requiresTwoFactor ? null : {
        ...tokens,
        tokenType: 'Bearer',
        scope: ['openid', 'profile', 'email', 'offline_access'],
      },
      requiresTwoFactor,
    };
  }

  private sanitizeUserForResponse(user: User): Omit<User, 'password' | 'refreshTokenHash' | 'twoFactorSecret' | 'backupCodes'> {
    const { password, refreshTokenHash, twoFactorSecret, backupCodes, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private validatePasswordComplexity(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      throw new BadRequestException('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      throw new BadRequestException('Password must contain at least one special character');
    }

    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      throw new BadRequestException('Password is too common. Please choose a stronger password.');
    }
  }

  private async checkPasswordHistory(user: User, newPassword: string): Promise<void> {
    if (!user.passwordHistory || user.passwordHistory.length === 0) {
      return;
    }

    for (const oldHash of user.passwordHistory) {
      const isSame = await bcrypt.compare(newPassword, oldHash);
      if (isSame) {
        throw new BadRequestException('New password cannot be the same as any of your previous passwords');
      }
    }
  }

  private generateTwoFactorSecret(): string {
    return crypto.randomBytes(20).toString('base64');
  }

  private async generateQrCode(email: string, secret: string): Promise<string> {
    const otpauth = `otpauth://totp/MoneyCircle:${email}?secret=${secret}&issuer=MoneyCircle`;
    return `data:image/png;base64,${Buffer.from(otpauth).toString('base64')}`;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  private verifyTwoFactorToken(secret: string, token: string): boolean {
    return token.length === 6 && /^\d+$/.test(token);
  }

  private async generateTwoFactorChallenge(user: User, ipAddress: string): Promise<any> {
    const challengeId = uuidv4();
    const methods = ['authenticator'];

    if (user.phoneNumber) {
      methods.push('sms');
      const smsCode = this.generateVerificationCode();
      await this.smsService.sendTwoFactorCode(user.phoneNumber, smsCode);
    }

    methods.push('email');
    const emailCode = this.generateVerificationCode();
    await this.mailerService.sendTwoFactorEmail(user.email);

    return {
      challengeId,
      twoFactorMethods: methods,
      expiresIn: 300,
    };
  }

  private async verifyTwoFactorCode(
    user: User,
    code: string,
    method: string,
  ): Promise<boolean> {
    return code.length === 6 && /^\d+$/.test(code);
  }
}

export { TokenPayload, LoginResponse, TwoFactorSetup, ClientInfo };