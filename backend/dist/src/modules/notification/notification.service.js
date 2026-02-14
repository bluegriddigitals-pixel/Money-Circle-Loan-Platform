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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const notification_preference_entity_1 = require("./entities/notification-preference.entity");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationRepository, notificationPreferenceRepository) {
        this.notificationRepository = notificationRepository;
        this.notificationPreferenceRepository = notificationPreferenceRepository;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async sendVerificationEmail(user) {
        this.logger.log(`Sending verification email to ${user.email}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.EMAIL,
            title: 'Verify Your Email',
            content: `Please verify your email address: ${user.email}`,
            metadata: { email: user.email },
        });
    }
    async sendEmailVerifiedNotification(user) {
        this.logger.log(`Sending email verified notification to ${user.email}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.IN_APP,
            title: 'Email Verified',
            content: 'Your email has been successfully verified.',
        });
    }
    async sendPhoneVerifiedNotification(user) {
        this.logger.log(`Sending phone verified notification to user ${user.id}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.IN_APP,
            title: 'Phone Verified',
            content: 'Your phone number has been successfully verified.',
        });
    }
    async sendSecurityAlert(user, alertType, details) {
        this.logger.log(`Sending security alert to user ${user.id}: ${alertType}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.EMAIL,
            title: `Security Alert: ${alertType}`,
            content: `A security alert has been triggered: ${alertType}`,
            metadata: { alertType, details },
        });
    }
    async sendSuspiciousActivityAlert(user, activity) {
        this.logger.log(`Sending suspicious activity alert to user ${user.id}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.EMAIL,
            title: 'Suspicious Activity Detected',
            content: 'We detected suspicious activity on your account.',
            metadata: { activity },
        });
    }
    async sendPasswordChangeNotification(user) {
        this.logger.log(`Sending password change notification to user ${user.id}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.EMAIL,
            title: 'Password Changed',
            content: 'Your password has been successfully changed.',
        });
    }
    async sendPasswordResetConfirmation(user) {
        this.logger.log(`Sending password reset confirmation to user ${user.id}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.EMAIL,
            title: 'Password Reset',
            content: 'Your password has been successfully reset.',
        });
    }
    async sendTwoFactorEnabledNotification(user) {
        this.logger.log(`Sending 2FA enabled notification to user ${user.id}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.EMAIL,
            title: 'Two-Factor Authentication Enabled',
            content: 'Two-factor authentication has been enabled on your account.',
        });
    }
    async sendTwoFactorDisabledNotification(user) {
        this.logger.log(`Sending 2FA disabled notification to user ${user.id}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.EMAIL,
            title: 'Two-Factor Authentication Disabled',
            content: 'Two-factor authentication has been disabled on your account.',
        });
    }
    async sendNewUserNotification(user) {
        this.logger.log(`Sending new user notification for user ${user.id}`);
        await this.createNotification({
            userId: user.id,
            type: notification_entity_1.NotificationType.EMAIL,
            title: 'Welcome to Money Circle!',
            content: `Welcome ${user.firstName}! Thank you for joining Money Circle.`,
        });
    }
    async sendTransactionNotification(transaction) {
        this.logger.log(`Sending transaction notification for transaction ${transaction.id}`);
        await this.createNotification({
            userId: transaction.userId,
            type: notification_entity_1.NotificationType.IN_APP,
            title: 'Transaction Completed',
            content: `Transaction of $${transaction.amount} completed successfully.`,
            metadata: { transactionId: transaction.id },
        });
    }
    async sendPayoutRequestNotification(payoutRequest) {
        this.logger.log(`Sending payout request notification for request ${payoutRequest.id}`);
        await this.createNotification({
            userId: payoutRequest.userId,
            type: notification_entity_1.NotificationType.IN_APP,
            title: 'Payout Request Created',
            content: `Your payout request for $${payoutRequest.amount} has been created.`,
            metadata: { payoutRequestId: payoutRequest.id },
        });
    }
    async sendPayoutApprovalNotification(payoutRequest) {
        this.logger.log(`Sending payout approval notification for request ${payoutRequest.id}`);
        await this.createNotification({
            userId: payoutRequest.userId,
            type: notification_entity_1.NotificationType.IN_APP,
            title: 'Payout Request Approved',
            content: `Your payout request for $${payoutRequest.amount} has been approved.`,
            metadata: { payoutRequestId: payoutRequest.id },
        });
    }
    async sendPayoutCompletionNotification(payoutRequest) {
        this.logger.log(`Sending payout completion notification for request ${payoutRequest.id}`);
        await this.createNotification({
            userId: payoutRequest.userId,
            type: notification_entity_1.NotificationType.IN_APP,
            title: 'Payout Request Completed',
            content: `Your payout request for $${payoutRequest.amount} has been completed.`,
            metadata: { payoutRequestId: payoutRequest.id },
        });
    }
    async sendPayoutRejectionNotification(payoutRequest) {
        this.logger.log(`Sending payout rejection notification for request ${payoutRequest.id}`);
        await this.createNotification({
            userId: payoutRequest.userId,
            type: notification_entity_1.NotificationType.IN_APP,
            title: 'Payout Request Rejected',
            content: `Your payout request for $${payoutRequest.amount} has been rejected.`,
            metadata: { payoutRequestId: payoutRequest.id, reason: payoutRequest.rejectionReason },
        });
    }
    async sendDisbursementNotification(disbursement) {
        this.logger.log(`Sending disbursement notification for disbursement ${disbursement.id}`);
        await this.createNotification({
            userId: disbursement.userId,
            type: notification_entity_1.NotificationType.IN_APP,
            title: 'Disbursement Processed',
            content: `Disbursement of $${disbursement.amount} has been processed.`,
            metadata: { disbursementId: disbursement.id },
        });
    }
    async sendDisbursementApprovalNotification(disbursement) {
        this.logger.log(`Sending disbursement approval notification for disbursement ${disbursement.id}`);
        await this.createNotification({
            userId: disbursement.userId,
            type: notification_entity_1.NotificationType.IN_APP,
            title: 'Disbursement Approved',
            content: `Disbursement of $${disbursement.amount} has been approved.`,
            metadata: { disbursementId: disbursement.id },
        });
    }
    async createNotification(data) {
        const notification = this.notificationRepository.create({
            userId: data.userId,
            type: data.type,
            title: data.title,
            content: data.content,
            metadata: data.metadata || {},
            status: notification_entity_1.NotificationStatus.SENT,
            sentAt: new Date(),
        });
        return this.notificationRepository.save(notification);
    }
    async getUserNotifications(userId, limit = 50) {
        return this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async markAsRead(notificationId) {
        await this.notificationRepository.update(notificationId, {
            status: notification_entity_1.NotificationStatus.READ,
            readAt: new Date(),
        });
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ userId, status: notification_entity_1.NotificationStatus.SENT }, { status: notification_entity_1.NotificationStatus.READ, readAt: new Date() });
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: { userId, status: notification_entity_1.NotificationStatus.SENT },
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_preference_entity_1.NotificationPreference)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map