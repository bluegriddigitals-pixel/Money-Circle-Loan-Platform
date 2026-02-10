"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../user/entities/user.entity");
const user_profile_entity_1 = require("../user/entities/user-profile.entity");
let AuthService = class AuthService {
    constructor(usersRepository, profilesRepository, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.profilesRepository = profilesRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = this.usersRepository.create({
            email: registerDto.email,
            passwordHash: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phoneNumber: registerDto.phoneNumber,
            dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null,
            role: registerDto.role,
            status: user_entity_1.AccountStatus.ACTIVE,
            kycStatus: 'not_started',
            isEmailVerified: false,
            isPhoneVerified: false,
            is2faEnabled: false,
            country: 'South Africa',
        });
        await this.usersRepository.save(user);
        const profile = this.profilesRepository.create({
            userId: user.id,
            employmentStatus: null,
            employerName: null,
            jobTitle: null,
            monthlyIncome: null,
            yearsEmployed: null,
            creditScore: 0,
            totalBorrowed: 0,
            totalRepaid: 0,
            totalInvested: 0,
            totalEarned: 0,
            outstandingBalance: 0,
            riskLevel: 'medium',
            riskScore: 50,
            language: 'en',
            currency: 'ZAR',
            notificationPreferences: { email: true, sms: false, push: true },
        });
        await this.profilesRepository.save(profile);
        const tokens = await this.generateTokens(user);
        return { user, tokens };
    }
    async login(loginDto) {
        const user = await this.usersRepository.findOne({
            where: { email: loginDto.email },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== user_entity_1.AccountStatus.ACTIVE) {
            throw new common_1.ForbiddenException(`Account is ${user.status}`);
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.lastLogin = new Date();
        await this.usersRepository.save(user);
        const tokens = await this.generateTokens(user);
        return { user, tokens };
    }
    async generateTokens(user) {
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
    async validateUser(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user || user.status !== user_entity_1.AccountStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map