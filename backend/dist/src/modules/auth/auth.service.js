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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../user/entities/user.entity");
const notification_service_1 = require("../notification/notification.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, jwtService, notificationService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, phoneNumber } = registerDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            verificationStatus: user_entity_1.VerificationStatus.UNVERIFIED,
        });
        await this.userRepository.save(user);
        await this.notificationService.sendNewUserNotification(user);
        const token = this.generateToken(user);
        const { password: _, ...result } = user;
        return { user: result, token };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['profile']
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
        const token = this.generateToken(user);
        const { password: _, ...result } = user;
        return { user: result, token };
    }
    async verifyEmail(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.verificationStatus === user_entity_1.VerificationStatus.UNVERIFIED) {
            user.verificationStatus = user_entity_1.VerificationStatus.EMAIL_VERIFIED;
        }
        else if (user.verificationStatus === user_entity_1.VerificationStatus.PHONE_VERIFIED) {
            user.verificationStatus = user_entity_1.VerificationStatus.FULLY_VERIFIED;
        }
        await this.userRepository.save(user);
        await this.notificationService.sendEmailVerifiedNotification(user);
        return { message: 'Email verified successfully' };
    }
    async sendVerificationEmail(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        await this.notificationService.sendVerificationEmail(user);
        return { message: 'Verification email sent' };
    }
    async verifyPhone(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.verificationStatus === user_entity_1.VerificationStatus.UNVERIFIED) {
            user.verificationStatus = user_entity_1.VerificationStatus.PHONE_VERIFIED;
        }
        else if (user.verificationStatus === user_entity_1.VerificationStatus.EMAIL_VERIFIED) {
            user.verificationStatus = user_entity_1.VerificationStatus.FULLY_VERIFIED;
        }
        await this.userRepository.save(user);
        await this.notificationService.sendPhoneVerifiedNotification(user);
        return { message: 'Phone verified successfully' };
    }
    async requestPasswordReset(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            return { message: 'If your email exists, you will receive a password reset link' };
        }
        const resetToken = this.jwtService.sign({ sub: user.id, type: 'password-reset' }, { expiresIn: '1h' });
        this.logger.log(`Password reset token for ${email}: ${resetToken}`);
        await this.notificationService.sendPasswordResetConfirmation(user);
        return { message: 'If your email exists, you will receive a password reset link' };
    }
    async resetPassword(token, newPassword) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.userRepository.findOne({ where: { id: payload.sub } });
            if (!user) {
                throw new common_1.BadRequestException('Invalid token');
            }
            const saltRounds = 10;
            user.password = await bcrypt.hash(newPassword, saltRounds);
            await this.userRepository.save(user);
            await this.notificationService.sendPasswordChangeNotification(user);
            return { message: 'Password reset successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const saltRounds = 10;
        user.password = await bcrypt.hash(newPassword, saltRounds);
        await this.userRepository.save(user);
        await this.notificationService.sendPasswordChangeNotification(user);
        return { message: 'Password changed successfully' };
    }
    async enableTwoFactor(userId, ipAddress) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        user.isTwoFactorEnabled = true;
        await this.userRepository.save(user);
        await this.notificationService.sendTwoFactorEnabledNotification(user);
        await this.notificationService.sendSecurityAlert(user, '2FA_ENABLED', { ipAddress });
        return { message: 'Two-factor authentication enabled' };
    }
    async disableTwoFactor(userId, ipAddress) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        user.isTwoFactorEnabled = false;
        await this.userRepository.save(user);
        await this.notificationService.sendTwoFactorDisabledNotification(user);
        await this.notificationService.sendSecurityAlert(user, '2FA_DISABLED', { ipAddress });
        return { message: 'Two-factor authentication disabled' };
    }
    async sendSecurityAlertEmail(userId, alertType, details) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        await this.notificationService.sendSecurityAlert(user, alertType, details);
        return { message: 'Security alert sent' };
    }
    async sendSuspiciousActivityAlert(userId, activity) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        await this.notificationService.sendSuspiciousActivityAlert(user, activity);
        return { message: 'Suspicious activity alert sent' };
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        notification_service_1.NotificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map