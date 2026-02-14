import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendSms(phoneNumber: string, message: string): Promise<void> {
    // In development, just log the SMS
    this.logger.log(`SMS to ${phoneNumber}: ${message}`);
    
    // In production, you would integrate with an SMS provider like Twilio
    // Example with Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    */
    
    return Promise.resolve();
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    const message = `Your Money Circle verification code is: ${code}`;
    await this.sendSms(phoneNumber, message);
  }

  async sendTransactionAlert(phoneNumber: string, amount: number, type: string): Promise<void> {
    const message = `Money Circle: ${type} of $${amount} processed successfully.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendLoanDisbursementNotification(phoneNumber: string, amount: number, loanId: string): Promise<void> {
    const message = `Money Circle: Your loan of $${amount} (ID: ${loanId}) has been disbursed to your account.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendPaymentReminder(phoneNumber: string, amount: number, dueDate: string): Promise<void> {
    const message = `Money Circle: Payment of $${amount} is due on ${dueDate}. Please ensure sufficient funds.`;
    await this.sendSms(phoneNumber, message);
  }
}
