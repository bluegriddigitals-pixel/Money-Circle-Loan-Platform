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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_profile_entity_1 = require("./entities/user-profile.entity");
const kyc_entity_1 = require("../compliance/entities/kyc.entity");
const user_entity_2 = require("./entities/user.entity");
let UserService = UserService_1 = class UserService {
    constructor(usersRepository, profilesRepository) {
        this.usersRepository = usersRepository;
        this.profilesRepository = profilesRepository;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        const user = await this.usersRepository.findOne({
            where: { email },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async create(userData) {
        const user = this.usersRepository.create(userData);
        return await this.usersRepository.save(user);
    }
    async update(id, userData) {
        await this.usersRepository.update(id, userData);
        return this.findById(id);
    }
    async updateKycStatus(userId, kycStatus) {
        const user = await this.findById(userId);
        user.kycStatus = kycStatus;
        return this.usersRepository.save(user);
    }
    async initializeUserAccount(userId) {
        try {
            const user = await this.usersRepository.findOne({
                where: { id: userId }
            });
            if (user) {
                user.accountStatus = user_entity_2.AccountStatus.ACTIVE;
                user.verificationStatus = user_entity_2.VerificationStatus.EMAIL_VERIFIED;
                user.kycStatus = kyc_entity_1.KycStatus.NOT_STARTED;
                await this.usersRepository.save(user);
                this.logger.log(`User account initialized: ${userId}`);
                if (!user.profile) {
                    const profile = this.profilesRepository.create({
                        user: user,
                        notificationPreferences: {
                            email: true,
                            sms: false,
                            push: false,
                            marketing: false,
                        },
                        privacySettings: {
                            profileVisibility: 'PRIVATE',
                            activityVisibility: 'FRIENDS_ONLY',
                            searchVisibility: true,
                        },
                        securitySettings: {
                            twoFactorEnabled: false,
                            biometricEnabled: false,
                            sessionTimeout: 30,
                            loginAlerts: true,
                            unusualActivityAlerts: true,
                        },
                    });
                    await this.profilesRepository.save(profile);
                    this.logger.log(`Default profile created for user: ${userId}`);
                }
            }
            else {
                this.logger.warn(`User not found for account initialization: ${userId}`);
                throw new common_1.NotFoundException('User not found');
            }
        }
        catch (error) {
            this.logger.error(`Failed to initialize user account ${userId}: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to initialize user account');
        }
    }
    async getDashboard(userId) {
        const user = await this.findById(userId);
        const dashboardData = {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                accountStatus: user.accountStatus,
                kycStatus: user.kycStatus,
            },
            profile: user.profile,
        };
        return dashboardData;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map