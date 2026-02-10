import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { User, AccountStatus, UserRole, KycStatus } from "../user/entities/user.entity";
import { UserProfile, RiskLevel } from "../user/entities/user-profile.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profilesRepository: Repository<UserProfile>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; tokens: any }> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user using save() instead of create() to avoid type issues
    const user = new User();
    user.email = registerDto.email;
    user.passwordHash = hashedPassword;
    user.firstName = registerDto.firstName;
    user.lastName = registerDto.lastName;
    user.phoneNumber = registerDto.phoneNumber;
    user.dateOfBirth = registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null;
    user.role = registerDto.role;
    user.status = AccountStatus.ACTIVE;
    user.kycStatus = KycStatus.NOT_STARTED;
    user.isEmailVerified = false;
    user.isPhoneVerified = false;
    user.is2faEnabled = false;
    user.country = "South Africa";

    await this.usersRepository.save(user);

    // Create user profile
    const profile = new UserProfile();
    profile.userId = user.id;
    profile.employmentStatus = null;
    profile.employerName = null;
    profile.jobTitle = null;
    profile.monthlyIncome = null;
    profile.yearsEmployed = null;
    profile.creditScore = 0;
    profile.totalBorrowed = 0;
    profile.totalRepaid = 0;
    profile.totalInvested = 0;
    profile.totalEarned = 0;
    profile.outstandingBalance = 0;
    profile.riskLevel = RiskLevel.MEDIUM;
    profile.riskScore = 50;
    profile.language = "en";
    profile.currency = "ZAR";
    profile.notificationPreferences = { email: true, sms: false, push: true };

    await this.profilesRepository.save(profile);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; tokens: any }> {
    // Find user
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      relations: ["profile"],
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check account status
    if (user.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(`Account is ${user.status}`);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Update last login
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
      secret: this.configService.get("jwt.secret"),
      expiresIn: this.configService.get("jwt.accessTokenExpiry"),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get("jwt.secret"),
      expiresIn: this.configService.get("jwt.refreshTokenExpiry"),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ["profile"],
    });

    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException("User not found or inactive");
    }

    return user;
  }
}