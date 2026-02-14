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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.SubscriptionTier = exports.LoginMethod = exports.VerificationStatus = exports.AccountStatus = exports.UserRole = exports.KycStatus = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_profile_entity_1 = require("./user-profile.entity");
const loan_application_entity_1 = require("../../loan/entities/loan-application.entity");
const loan_entity_1 = require("../../loan/entities/loan.entity");
const loan_guarantor_entity_1 = require("../../loan/entities/loan-guarantor.entity");
const payment_method_entity_1 = require("../../payment/entities/payment-method.entity");
const payout_request_entity_1 = require("../../payment/entities/payout-request.entity");
const investment_entity_1 = require("../../marketplace/entities/investment.entity");
const aml_alert_entity_1 = require("../../compliance/entities/aml-alert.entity");
const sanction_screening_entity_1 = require("../../compliance/entities/sanction-screening.entity");
const compliance_check_entity_1 = require("../../compliance/entities/compliance-check.entity");
const kyc_entity_1 = require("../../compliance/entities/kyc.entity");
const kyc_entity_2 = require("../../compliance/entities/kyc.entity");
var kyc_entity_3 = require("../../compliance/entities/kyc.entity");
Object.defineProperty(exports, "KycStatus", { enumerable: true, get: function () { return kyc_entity_3.KycStatus; } });
var UserRole;
(function (UserRole) {
    UserRole["BORROWER"] = "borrower";
    UserRole["LENDER"] = "lender";
    UserRole["ADMIN"] = "admin";
    UserRole["AUDITOR"] = "auditor";
    UserRole["TRANSACTION_ADMIN"] = "transaction_admin";
    UserRole["SYSTEM_ADMIN"] = "system_admin";
    UserRole["COMPLIANCE_OFFICER"] = "compliance_officer";
    UserRole["RISK_ANALYST"] = "risk_analyst";
    UserRole["CUSTOMER_SUPPORT"] = "customer_support";
    UserRole["FINANCIAL_ADVISOR"] = "financial_advisor";
    UserRole["LEGAL_ADVISOR"] = "legal_advisor";
    UserRole["PARTNER"] = "partner";
    UserRole["AFFILIATE"] = "affiliate";
})(UserRole || (exports.UserRole = UserRole = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["DEACTIVATED"] = "DEACTIVATED";
    AccountStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    AccountStatus["REJECTED"] = "REJECTED";
    AccountStatus["FROZEN"] = "FROZEN";
    AccountStatus["RESTRICTED"] = "RESTRICTED";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["UNVERIFIED"] = "UNVERIFIED";
    VerificationStatus["EMAIL_VERIFIED"] = "EMAIL_VERIFIED";
    VerificationStatus["PHONE_VERIFIED"] = "PHONE_VERIFIED";
    VerificationStatus["FULLY_VERIFIED"] = "FULLY_VERIFIED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var LoginMethod;
(function (LoginMethod) {
    LoginMethod["EMAIL_PASSWORD"] = "email_password";
    LoginMethod["GOOGLE"] = "google";
    LoginMethod["FACEBOOK"] = "facebook";
    LoginMethod["APPLE"] = "apple";
    LoginMethod["PHONE_OTP"] = "phone_otp";
    LoginMethod["BIOMETRIC"] = "biometric";
})(LoginMethod || (exports.LoginMethod = LoginMethod = {}));
var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["FREE"] = "free";
    SubscriptionTier["BASIC"] = "basic";
    SubscriptionTier["PREMIUM"] = "premium";
    SubscriptionTier["ENTERPRISE"] = "enterprise";
})(SubscriptionTier || (exports.SubscriptionTier = SubscriptionTier = {}));
let User = class User {
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    get initials() {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }
    get isActive() {
        return this.accountStatus === AccountStatus.ACTIVE;
    }
    get isKycVerified() {
        return this.kycStatus === kyc_entity_2.KycStatus.VERIFIED;
    }
    get isEmailVerified() {
        return this.verificationStatus === VerificationStatus.EMAIL_VERIFIED ||
            this.verificationStatus === VerificationStatus.FULLY_VERIFIED;
    }
    get isPhoneVerified() {
        return this.verificationStatus === VerificationStatus.PHONE_VERIFIED ||
            this.verificationStatus === VerificationStatus.FULLY_VERIFIED;
    }
    get isFullyVerified() {
        return this.verificationStatus === VerificationStatus.FULLY_VERIFIED;
    }
    get age() {
        if (!this.dateOfBirth)
            return null;
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    get isOfLegalAge() {
        return this.age !== null && this.age >= 18;
    }
    get accountAgeInDays() {
        if (!this.createdAt)
            return 0;
        const today = new Date();
        const created = new Date(this.createdAt);
        const diffTime = Math.abs(today.getTime() - created.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    get isNewAccount() {
        return this.accountAgeInDays < 30;
    }
    get canApplyForLoan() {
        return (this.isActive &&
            this.isKycVerified &&
            this.isFullyVerified &&
            this.isOfLegalAge &&
            this.accountAgeInDays >= 7);
    }
    get canInvest() {
        return (this.isActive &&
            this.isKycVerified &&
            this.isFullyVerified &&
            this.isOfLegalAge &&
            this.role === UserRole.LENDER);
    }
    get isAdmin() {
        return [
            UserRole.SYSTEM_ADMIN,
            UserRole.TRANSACTION_ADMIN,
            UserRole.COMPLIANCE_OFFICER,
            UserRole.RISK_ANALYST,
            UserRole.AUDITOR,
        ].includes(this.role);
    }
    get isStaff() {
        return this.isAdmin || [
            UserRole.CUSTOMER_SUPPORT,
            UserRole.FINANCIAL_ADVISOR,
            UserRole.LEGAL_ADVISOR,
        ].includes(this.role);
    }
    get hasPremiumSubscription() {
        return [
            SubscriptionTier.PREMIUM,
            SubscriptionTier.ENTERPRISE,
        ].includes(this.subscriptionTier);
    }
    get isSubscriptionActive() {
        if (!this.subscriptionExpiry)
            return false;
        return new Date() < this.subscriptionExpiry;
    }
    async beforeInsert() {
        if (!this.referralCode) {
            this.referralCode = this.generateReferralCode();
        }
        if (!this.preferences) {
            this.preferences = {
                theme: 'light',
                notifications: {
                    email: true,
                    push: true,
                    sms: this.phoneNumber ? true : false,
                },
                privacy: {
                    profileVisibility: 'public',
                    showEmail: false,
                    showPhone: false,
                },
            };
        }
        this.validateAge();
    }
    async beforeUpdate() {
        if (this.dateOfBirth) {
            this.validateAge();
        }
    }
    async afterInsert() {
        console.log(`User created: ${this.email} (${this.id})`);
    }
    async afterUpdate() {
        console.log(`User updated: ${this.email} (${this.id})`);
    }
    async afterRemove() {
        console.log(`User removed: ${this.email} (${this.id})`);
    }
    validateAge() {
        if (this.dateOfBirth && this.age !== null) {
            if (this.age < 18) {
                throw new Error('User must be at least 18 years old');
            }
            if (this.age > 120) {
                throw new Error('Invalid date of birth');
            }
        }
    }
    updateActivity() {
        this.lastActivityAt = new Date();
    }
    verifyEmail() {
        if (!this.isEmailVerified) {
            if (this.verificationStatus === VerificationStatus.PHONE_VERIFIED) {
                this.verificationStatus = VerificationStatus.FULLY_VERIFIED;
            }
            else {
                this.verificationStatus = VerificationStatus.EMAIL_VERIFIED;
            }
            this.emailVerificationToken = null;
            this.emailVerificationTokenExpiry = null;
        }
    }
    verifyPhone() {
        if (!this.isPhoneVerified) {
            if (this.verificationStatus === VerificationStatus.EMAIL_VERIFIED) {
                this.verificationStatus = VerificationStatus.FULLY_VERIFIED;
            }
            else {
                this.verificationStatus = VerificationStatus.PHONE_VERIFIED;
            }
            this.phoneVerificationCode = null;
            this.phoneVerificationCodeExpiry = null;
        }
    }
    suspend(reason) {
        this.accountStatus = AccountStatus.SUSPENDED;
        this.deactivationReason = reason;
        this.deactivatedAt = new Date();
    }
    activate() {
        this.accountStatus = AccountStatus.ACTIVE;
        this.deactivationReason = null;
        this.deactivatedAt = null;
    }
    deactivate(reason) {
        this.accountStatus = AccountStatus.DEACTIVATED;
        this.deactivationReason = reason;
        this.deactivatedAt = new Date();
    }
    freeze(reason) {
        this.accountStatus = AccountStatus.FROZEN;
        this.deactivationReason = reason;
        this.deactivatedAt = new Date();
    }
    restrict(reason) {
        this.accountStatus = AccountStatus.RESTRICTED;
        this.deactivationReason = reason;
        this.deactivatedAt = new Date();
    }
    completeKyc() {
        this.kycStatus = kyc_entity_2.KycStatus.VERIFIED;
    }
    rejectKyc(reason) {
        this.kycStatus = kyc_entity_2.KycStatus.REJECTED;
        this.deactivationReason = reason;
    }
    setKycInProgress() {
        this.kycStatus = kyc_entity_2.KycStatus.IN_PROGRESS;
    }
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    toJSON() {
        const obj = { ...this };
        delete obj.password;
        delete obj.refreshTokenHash;
        delete obj.twoFactorSecret;
        delete obj.backupCodes;
        delete obj.emailVerificationToken;
        delete obj.emailVerificationTokenExpiry;
        delete obj.phoneVerificationCode;
        delete obj.phoneVerificationCodeExpiry;
        delete obj.passwordResetToken;
        delete obj.passwordResetTokenExpiry;
        delete obj.accountLockedUntil;
        delete obj.passwordHistory;
        delete obj.securityQuestions;
        delete obj.deletedAt;
        return obj;
    }
    toString() {
        return `User#${this.id} (${this.email})`;
    }
};
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the user',
        example: '123e4567-e89b-12d3-a456-426614174000',
        readOnly: true,
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User email address (unique)',
        example: 'john.doe@example.com',
    }),
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: false,
        unique: true,
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    (0, class_validator_1.MaxLength)(255, { message: 'Email cannot be longer than 255 characters' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User password (hashed)',
        writeOnly: true,
        minLength: 8,
        example: 'StrongP@ssw0rd123',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Password cannot be longer than 100 characters' }),
    (0, class_validator_1.Matches)(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
    }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", String)
], User.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User first name',
        example: 'John',
        minLength: 2,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'First name cannot be longer than 100 characters' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s\-']+$/, {
        message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
    }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User last name',
        example: 'Doe',
        minLength: 2,
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Last name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Last name cannot be longer than 100 characters' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s\-']+$/, {
        message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
    }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User phone number with country code',
        example: '+1234567890',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true, unique: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(null, { message: 'Please provide a valid phone number with country code' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.replace(/\s/g, '').replace(/^0/, '+')),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User date of birth',
        example: '1990-01-01',
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User role in the system',
        enum: UserRole,
        example: UserRole.BORROWER,
        default: UserRole.BORROWER,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.BORROWER,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(UserRole, { message: 'Please provide a valid user role' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account status',
        enum: AccountStatus,
        example: AccountStatus.PENDING_VERIFICATION,
        default: AccountStatus.PENDING_VERIFICATION,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.PENDING_VERIFICATION,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(AccountStatus),
    __metadata("design:type", String)
], User.prototype, "accountStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'KYC verification status',
        enum: kyc_entity_2.KycStatus,
        example: kyc_entity_2.KycStatus.NOT_STARTED,
        default: kyc_entity_2.KycStatus.NOT_STARTED,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: kyc_entity_2.KycStatus,
        default: kyc_entity_2.KycStatus.NOT_STARTED,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(kyc_entity_2.KycStatus),
    __metadata("design:type", String)
], User.prototype, "kycStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Verification status for email and phone',
        enum: VerificationStatus,
        example: VerificationStatus.UNVERIFIED,
        default: VerificationStatus.UNVERIFIED,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VerificationStatus,
        default: VerificationStatus.UNVERIFIED,
        nullable: false,
    }),
    (0, class_validator_1.IsEnum)(VerificationStatus),
    __metadata("design:type", String)
], User.prototype, "verificationStatus", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", String)
], User.prototype, "emailVerificationToken", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], User.prototype, "emailVerificationTokenExpiry", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 6, nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", String)
], User.prototype, "phoneVerificationCode", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], User.prototype, "phoneVerificationCodeExpiry", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", String)
], User.prototype, "twoFactorSecret", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether two-factor authentication is enabled',
        example: false,
        default: false,
    }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false, nullable: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], User.prototype, "isTwoFactorEnabled", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "backupCodes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last login timestamp',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last activity timestamp',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], User.prototype, "lastActivityAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last password change timestamp',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], User.prototype, "lastPasswordChangeAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account creation timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        readOnly: true,
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Account deactivation timestamp',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], User.prototype, "deactivatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for account deactivation/suspension',
        example: 'Violation of terms of service',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Deactivation reason cannot exceed 1000 characters' }),
    __metadata("design:type", String)
], User.prototype, "deactivationReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'IP address from registration',
        example: '192.168.1.1',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], User.prototype, "registrationIp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User agent from registration',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], User.prototype, "registrationUserAgent", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", String)
], User.prototype, "registrationDeviceFingerprint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Accepted terms and conditions version',
        example: '1.0.0',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], User.prototype, "acceptedTermsVersion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Accepted privacy policy version',
        example: '1.0.0',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], User.prototype, "acceptedPrivacyVersion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Marketing consent',
        example: false,
        default: false,
    }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false, nullable: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], User.prototype, "marketingConsent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data processing consent (GDPR)',
        example: true,
        default: true,
    }),
    (0, typeorm_1.Column)({ type: 'boolean', default: true, nullable: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], User.prototype, "dataProcessingConsent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred language',
        example: 'en',
        default: 'en',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'en', nullable: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], User.prototype, "preferredLanguage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred currency',
        example: 'USD',
        default: 'USD',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD', nullable: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], User.prototype, "preferredCurrency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Time zone',
        example: 'America/New_York',
        default: 'UTC',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'UTC', nullable: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], User.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Profile image URL',
        example: 'https://example.com/profile.jpg',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2048, { message: 'Profile image URL cannot exceed 2048 characters' }),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Biography or description',
        example: 'Experienced investor with 10+ years in peer-to-peer lending',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000, { message: 'Biography cannot exceed 5000 characters' }),
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Occupation',
        example: 'Software Engineer',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], User.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Company name',
        example: 'Tech Corp Inc.',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], User.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Website URL',
        example: 'https://john.doe.example.com',
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2048),
    __metadata("design:type", String)
], User.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Social media profiles',
        example: {
            linkedin: 'https://linkedin.com/in/johndoe',
            twitter: 'https://twitter.com/johndoe',
            facebook: 'https://facebook.com/johndoe',
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], User.prototype, "socialMedia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Address information',
        example: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10001',
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], User.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", String)
], User.prototype, "passwordResetToken", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], User.prototype, "passwordResetTokenExpiry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Failed login attempts count',
        example: 0,
        default: 0,
    }),
    (0, typeorm_1.Column)({ type: 'integer', default: 0, nullable: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], User.prototype, "failedLoginAttempts", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Date)
], User.prototype, "accountLockedUntil", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Array)
], User.prototype, "passwordHistory", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
    __metadata("design:type", Array)
], User.prototype, "securityQuestions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last login IP address',
        example: '192.168.1.100',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], User.prototype, "lastLoginIp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last login device fingerprint',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], User.prototype, "lastLoginDevice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last login method',
        enum: LoginMethod,
        example: LoginMethod.EMAIL_PASSWORD,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LoginMethod,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(LoginMethod),
    __metadata("design:type", String)
], User.prototype, "lastLoginMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Subscription tier',
        enum: SubscriptionTier,
        example: SubscriptionTier.FREE,
        default: SubscriptionTier.FREE,
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SubscriptionTier,
        default: SubscriptionTier.FREE,
        nullable: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SubscriptionTier),
    __metadata("design:type", String)
], User.prototype, "subscriptionTier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Subscription expiry date',
    }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], User.prototype, "subscriptionExpiry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Referral code (unique)',
        example: 'JOHNDOE123',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true, unique: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], User.prototype, "referralCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Referrer user ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], User.prototype, "referredBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total referral count',
        example: 5,
        default: 0,
    }),
    (0, typeorm_1.Column)({ type: 'integer', default: 0, nullable: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], User.prototype, "referralCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total referral earnings',
        example: 500.50,
        default: 0,
    }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], User.prototype, "referralEarnings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'External user ID (for third-party integrations)',
        example: 'ext_123456789',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, unique: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], User.prototype, "externalId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'External provider (e.g., google, facebook)',
        example: 'google',
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], User.prototype, "externalProvider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Metadata for custom fields',
        example: { customField1: 'value1', customField2: 'value2' },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], User.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tags for categorization',
        example: ['vip', 'early-adopter', 'whale'],
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], User.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User preferences',
        example: {
            theme: 'dark',
            notifications: {
                email: true,
                push: true,
                sms: false,
            },
        },
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], User.prototype, "preferences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User profile information',
        type: () => user_profile_entity_1.UserProfile,
    }),
    (0, typeorm_1.OneToOne)(() => user_profile_entity_1.UserProfile, (profile) => profile.user, {
        cascade: true,
        eager: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => user_profile_entity_1.UserProfile),
    __metadata("design:type", user_profile_entity_1.UserProfile)
], User.prototype, "profile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loan applications submitted by the user',
        type: () => [loan_application_entity_1.LoanApplication],
    }),
    (0, typeorm_1.OneToMany)(() => loan_application_entity_1.LoanApplication, (application) => application.user, {
        cascade: false,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => loan_application_entity_1.LoanApplication),
    __metadata("design:type", Array)
], User.prototype, "loanApplications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loans borrowed by the user',
        type: () => [loan_entity_1.Loan],
    }),
    (0, typeorm_1.OneToMany)(() => loan_entity_1.Loan, (loan) => loan.borrower, {
        cascade: false,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => loan_entity_1.Loan),
    __metadata("design:type", Array)
], User.prototype, "loans", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Guarantor obligations for the user',
        type: () => [loan_guarantor_entity_1.LoanGuarantor],
    }),
    (0, typeorm_1.OneToMany)(() => loan_guarantor_entity_1.LoanGuarantor, (guarantor) => guarantor.user, {
        cascade: false,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => loan_guarantor_entity_1.LoanGuarantor),
    __metadata("design:type", Array)
], User.prototype, "guarantors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment methods for the user',
        type: () => [payment_method_entity_1.PaymentMethod],
    }),
    (0, typeorm_1.OneToMany)(() => payment_method_entity_1.PaymentMethod, (paymentMethod) => paymentMethod.user, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => payment_method_entity_1.PaymentMethod),
    __metadata("design:type", Array)
], User.prototype, "paymentMethods", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payout requests from the user',
        type: () => [payout_request_entity_1.PayoutRequest],
    }),
    (0, typeorm_1.OneToMany)(() => payout_request_entity_1.PayoutRequest, (payout) => payout.user, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => payout_request_entity_1.PayoutRequest),
    __metadata("design:type", Array)
], User.prototype, "payoutRequests", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Investments made by the user',
        type: () => [investment_entity_1.Investment],
    }),
    (0, typeorm_1.OneToMany)(() => investment_entity_1.Investment, (investment) => investment.investor, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => investment_entity_1.Investment),
    __metadata("design:type", Array)
], User.prototype, "investments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'KYC records for the user',
        type: () => [kyc_entity_1.Kyc],
    }),
    (0, typeorm_1.OneToMany)(() => kyc_entity_1.Kyc, (kyc) => kyc.user, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => kyc_entity_1.Kyc),
    __metadata("design:type", Array)
], User.prototype, "kyc", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Compliance checks for the user',
        type: () => [compliance_check_entity_1.ComplianceCheck],
    }),
    (0, typeorm_1.OneToMany)(() => compliance_check_entity_1.ComplianceCheck, (check) => check.user, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => compliance_check_entity_1.ComplianceCheck),
    __metadata("design:type", Array)
], User.prototype, "complianceChecks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sanction screenings for the user',
        type: () => [sanction_screening_entity_1.SanctionScreening],
    }),
    (0, typeorm_1.OneToMany)(() => sanction_screening_entity_1.SanctionScreening, (screening) => screening.user, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => sanction_screening_entity_1.SanctionScreening),
    __metadata("design:type", Array)
], User.prototype, "sanctionScreenings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'AML alerts for the user',
        type: () => [aml_alert_entity_1.AmlAlert],
    }),
    (0, typeorm_1.OneToMany)(() => aml_alert_entity_1.AmlAlert, (alert) => alert.user, {
        cascade: true,
        eager: false,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => aml_alert_entity_1.AmlAlert),
    __metadata("design:type", Array)
], User.prototype, "amlAlerts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full name of the user',
        example: 'John Doe',
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], User.prototype, "fullName", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Initials of the user',
        example: 'JD',
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], User.prototype, "initials", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the user account is active',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isActive", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether KYC is verified',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isKycVerified", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether email is verified',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isEmailVerified", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether phone is verified',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isPhoneVerified", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether user is fully verified',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isFullyVerified", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User age (calculated from date of birth)',
        example: 30,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], User.prototype, "age", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether user is of legal age',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isOfLegalAge", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account age in days',
        example: 30,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], User.prototype, "accountAgeInDays", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether account is new (less than 30 days)',
        example: true,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isNewAccount", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether account is eligible for loan application',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "canApplyForLoan", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether user can invest',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "canInvest", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether user is an admin',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isAdmin", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether user is staff',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isStaff", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether user has premium subscription',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "hasPremiumSubscription", null);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether subscription is active',
        example: false,
        readOnly: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], User.prototype, "isSubscriptionActive", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "beforeInsert", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "beforeUpdate", null);
__decorate([
    (0, typeorm_1.AfterInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "afterInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "afterUpdate", null);
__decorate([
    (0, typeorm_1.AfterRemove)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "afterRemove", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Index)(['email'], { unique: true, where: 'deleted_at IS NULL' }),
    (0, typeorm_1.Index)(['phoneNumber'], { unique: true, where: 'phone_number IS NOT NULL AND deleted_at IS NULL' }),
    (0, typeorm_1.Index)(['accountStatus']),
    (0, typeorm_1.Index)(['kycStatus']),
    (0, typeorm_1.Index)(['verificationStatus']),
    (0, typeorm_1.Index)(['role']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['lastLoginAt']),
    (0, typeorm_1.Index)(['referralCode'], { unique: true }),
    (0, typeorm_1.Index)(['externalId'], { unique: true, where: 'external_id IS NOT NULL' })
], User);
//# sourceMappingURL=user.entity.js.map