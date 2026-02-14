import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private notificationPreferenceRepository: Repository<NotificationPreference>,
  ) {}

  // ============ AUTH RELATED NOTIFICATIONS ============

  async sendVerificationEmail(user: User): Promise<void> {
    this.logger.log(`Sending verification email to ${user.email}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.EMAIL,
      title: 'Verify Your Email',
      content: `Please verify your email address: ${user.email}`,
      metadata: { email: user.email },
    });
  }

  async sendEmailVerifiedNotification(user: User): Promise<void> {
    this.logger.log(`Sending email verified notification to ${user.email}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.IN_APP,
      title: 'Email Verified',
      content: 'Your email has been successfully verified.',
    });
  }

  async sendPhoneVerifiedNotification(user: User): Promise<void> {
    this.logger.log(`Sending phone verified notification to user ${user.id}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.IN_APP,
      title: 'Phone Verified',
      content: 'Your phone number has been successfully verified.',
    });
  }

  async sendSecurityAlert(user: User, alertType: string, details: any): Promise<void> {
    this.logger.log(`Sending security alert to user ${user.id}: ${alertType}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.EMAIL,
      title: `Security Alert: ${alertType}`,
      content: `A security alert has been triggered: ${alertType}`,
      metadata: { alertType, details },
    });
  }

  async sendSuspiciousActivityAlert(user: User, activity: any): Promise<void> {
    this.logger.log(`Sending suspicious activity alert to user ${user.id}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.EMAIL,
      title: 'Suspicious Activity Detected',
      content: 'We detected suspicious activity on your account.',
      metadata: { activity },
    });
  }

  async sendPasswordChangeNotification(user: User): Promise<void> {
    this.logger.log(`Sending password change notification to user ${user.id}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.EMAIL,
      title: 'Password Changed',
      content: 'Your password has been successfully changed.',
    });
  }

  async sendPasswordResetConfirmation(user: User): Promise<void> {
    this.logger.log(`Sending password reset confirmation to user ${user.id}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.EMAIL,
      title: 'Password Reset',
      content: 'Your password has been successfully reset.',
    });
  }

  async sendTwoFactorEnabledNotification(user: User): Promise<void> {
    this.logger.log(`Sending 2FA enabled notification to user ${user.id}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.EMAIL,
      title: 'Two-Factor Authentication Enabled',
      content: 'Two-factor authentication has been enabled on your account.',
    });
  }

  async sendTwoFactorDisabledNotification(user: User): Promise<void> {
    this.logger.log(`Sending 2FA disabled notification to user ${user.id}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.EMAIL,
      title: 'Two-Factor Authentication Disabled',
      content: 'Two-factor authentication has been disabled on your account.',
    });
  }

  async sendNewUserNotification(user: User): Promise<void> {
    this.logger.log(`Sending new user notification for user ${user.id}`);
    
    await this.createNotification({
      userId: user.id,
      type: NotificationType.EMAIL,
      title: 'Welcome to Money Circle!',
      content: `Welcome ${user.firstName}! Thank you for joining Money Circle.`,
    });
  }

  // ============ TRANSACTION NOTIFICATIONS ============

  async sendTransactionNotification(transaction: any): Promise<void> {
    this.logger.log(`Sending transaction notification for transaction ${transaction.id}`);
    
    await this.createNotification({
      userId: transaction.userId,
      type: NotificationType.IN_APP,
      title: 'Transaction Completed',
      content: `Transaction of $${transaction.amount} completed successfully.`,
      metadata: { transactionId: transaction.id },
    });
  }

  // ============ PAYOUT NOTIFICATIONS ============

  async sendPayoutRequestNotification(payoutRequest: any): Promise<void> {
    this.logger.log(`Sending payout request notification for request ${payoutRequest.id}`);
    
    await this.createNotification({
      userId: payoutRequest.userId,
      type: NotificationType.IN_APP,
      title: 'Payout Request Created',
      content: `Your payout request for $${payoutRequest.amount} has been created.`,
      metadata: { payoutRequestId: payoutRequest.id },
    });
  }

  async sendPayoutApprovalNotification(payoutRequest: any): Promise<void> {
    this.logger.log(`Sending payout approval notification for request ${payoutRequest.id}`);
    
    await this.createNotification({
      userId: payoutRequest.userId,
      type: NotificationType.IN_APP,
      title: 'Payout Request Approved',
      content: `Your payout request for $${payoutRequest.amount} has been approved.`,
      metadata: { payoutRequestId: payoutRequest.id },
    });
  }

  async sendPayoutCompletionNotification(payoutRequest: any): Promise<void> {
    this.logger.log(`Sending payout completion notification for request ${payoutRequest.id}`);
    
    await this.createNotification({
      userId: payoutRequest.userId,
      type: NotificationType.IN_APP,
      title: 'Payout Request Completed',
      content: `Your payout request for $${payoutRequest.amount} has been completed.`,
      metadata: { payoutRequestId: payoutRequest.id },
    });
  }

  async sendPayoutRejectionNotification(payoutRequest: any): Promise<void> {
    this.logger.log(`Sending payout rejection notification for request ${payoutRequest.id}`);
    
    await this.createNotification({
      userId: payoutRequest.userId,
      type: NotificationType.IN_APP,
      title: 'Payout Request Rejected',
      content: `Your payout request for $${payoutRequest.amount} has been rejected.`,
      metadata: { payoutRequestId: payoutRequest.id, reason: payoutRequest.rejectionReason },
    });
  }

  // ============ DISBURSEMENT NOTIFICATIONS ============

  async sendDisbursementNotification(disbursement: any): Promise<void> {
    this.logger.log(`Sending disbursement notification for disbursement ${disbursement.id}`);
    
    await this.createNotification({
      userId: disbursement.userId,
      type: NotificationType.IN_APP,
      title: 'Disbursement Processed',
      content: `Disbursement of $${disbursement.amount} has been processed.`,
      metadata: { disbursementId: disbursement.id },
    });
  }

  async sendDisbursementApprovalNotification(disbursement: any): Promise<void> {
    this.logger.log(`Sending disbursement approval notification for disbursement ${disbursement.id}`);
    
    await this.createNotification({
      userId: disbursement.userId,
      type: NotificationType.IN_APP,
      title: 'Disbursement Approved',
      content: `Disbursement of $${disbursement.amount} has been approved.`,
      metadata: { disbursementId: disbursement.id },
    });
  }

  // ============ UTILITY METHODS ============

  private async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    metadata?: any;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      metadata: data.metadata || {},
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    });
    
    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(notificationId, {
      status: NotificationStatus.READ,
      readAt: new Date(),
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.SENT },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, status: NotificationStatus.SENT },
    });
  }
}
