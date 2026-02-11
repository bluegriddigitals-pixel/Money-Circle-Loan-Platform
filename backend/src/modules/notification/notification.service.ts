import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationChannel, NotificationStatus } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async sendTransactionNotification(transaction: any): Promise<void> {
    try {
      const notification = this.notificationRepository.create({
        userId: transaction.userId,
        type: NotificationType.TRANSACTION,
        channel: NotificationChannel.IN_APP,
        title: 'Transaction Completed',
        content: `Your transaction ${transaction.transactionNumber} of $${transaction.amount} was successful`,
        data: { transactionId: transaction.id, transactionNumber: transaction.transactionNumber, amount: transaction.amount },
      });
      
      await this.notificationRepository.save(notification);
      this.logger.log(`Transaction notification sent: ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send transaction notification: ${error.message}`);
    }
  }

  async sendPayoutRequestNotification(payoutRequest: any): Promise<void> {
    try {
      const notification = this.notificationRepository.create({
        userId: payoutRequest.userId,
        type: NotificationType.PAYOUT,
        channel: NotificationChannel.IN_APP,
        title: 'Payout Request Created',
        content: `Your payout request ${payoutRequest.requestNumber} for $${payoutRequest.amount} has been created`,
        data: { payoutRequestId: payoutRequest.id, requestNumber: payoutRequest.requestNumber, amount: payoutRequest.amount },
      });
      
      await this.notificationRepository.save(notification);
      this.logger.log(`Payout request notification sent: ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send payout request notification: ${error.message}`);
    }
  }

  async sendPayoutApprovalNotification(payoutRequest: any): Promise<void> {
    try {
      const notification = this.notificationRepository.create({
        userId: payoutRequest.userId,
        type: NotificationType.PAYOUT,
        channel: NotificationChannel.IN_APP,
        title: 'Payout Request Approved',
        content: `Your payout request ${payoutRequest.requestNumber} for $${payoutRequest.amount} has been approved`,
        data: { payoutRequestId: payoutRequest.id, requestNumber: payoutRequest.requestNumber, amount: payoutRequest.amount },
      });
      
      await this.notificationRepository.save(notification);
      this.logger.log(`Payout approval notification sent: ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send payout approval notification: ${error.message}`);
    }
  }

  async sendPayoutRejectionNotification(payoutRequest: any): Promise<void> {
    try {
      const notification = this.notificationRepository.create({
        userId: payoutRequest.userId,
        type: NotificationType.PAYOUT,
        channel: NotificationChannel.IN_APP,
        title: 'Payout Request Rejected',
        content: `Your payout request ${payoutRequest.requestNumber} has been rejected: ${payoutRequest.rejectionReason || 'No reason provided'}`,
        data: { payoutRequestId: payoutRequest.id, requestNumber: payoutRequest.requestNumber, reason: payoutRequest.rejectionReason },
      });
      
      await this.notificationRepository.save(notification);
      this.logger.log(`Payout rejection notification sent: ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send payout rejection notification: ${error.message}`);
    }
  }

  async sendPayoutCompletionNotification(payoutRequest: any): Promise<void> {
    try {
      const notification = this.notificationRepository.create({
        userId: payoutRequest.userId,
        type: NotificationType.PAYOUT,
        channel: NotificationChannel.IN_APP,
        title: 'Payout Completed',
        content: `Your payout request ${payoutRequest.requestNumber} for $${payoutRequest.amount} has been completed`,
        data: { payoutRequestId: payoutRequest.id, requestNumber: payoutRequest.requestNumber, amount: payoutRequest.amount },
      });
      
      await this.notificationRepository.save(notification);
      this.logger.log(`Payout completion notification sent: ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send payout completion notification: ${error.message}`);
    }
  }

  async sendDisbursementApprovalNotification(disbursement: any): Promise<void> {
    try {
      const notification = this.notificationRepository.create({
        userId: disbursement.userId,
        type: NotificationType.DISBURSEMENT,
        channel: NotificationChannel.IN_APP,
        title: 'Disbursement Approved',
        content: `Your disbursement ${disbursement.disbursementNumber} for $${disbursement.amount} has been approved`,
        data: { disbursementId: disbursement.id, disbursementNumber: disbursement.disbursementNumber, amount: disbursement.amount },
      });
      
      await this.notificationRepository.save(notification);
      this.logger.log(`Disbursement approval notification sent: ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send disbursement approval notification: ${error.message}`);
    }
  }

  async sendDisbursementNotification(disbursement: any): Promise<void> {
    try {
      const notification = this.notificationRepository.create({
        userId: disbursement.userId,
        type: NotificationType.DISBURSEMENT,
        channel: NotificationChannel.IN_APP,
        title: 'Disbursement Processed',
        content: `Your disbursement ${disbursement.disbursementNumber} for $${disbursement.amount} has been processed`,
        data: { disbursementId: disbursement.id, disbursementNumber: disbursement.disbursementNumber, amount: disbursement.amount },
      });
      
      await this.notificationRepository.save(notification);
      this.logger.log(`Disbursement notification sent: ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send disbursement notification: ${error.message}`);
    }
  }

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationRepository.update(id, {
      isRead: true,
      readAt: new Date(),
      status: NotificationStatus.READ,
    });
  }

  async markAsDelivered(id: string): Promise<void> {
    await this.notificationRepository.update(id, {
      deliveredAt: new Date(),
      status: NotificationStatus.DELIVERED,
    });
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }
}