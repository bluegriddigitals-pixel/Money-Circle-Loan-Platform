export declare class SmsService {
    private readonly logger;
    sendSms(phoneNumber: string, message: string): Promise<void>;
    sendVerificationCode(phoneNumber: string, code: string): Promise<void>;
    sendTransactionAlert(phoneNumber: string, amount: number, type: string): Promise<void>;
    sendLoanDisbursementNotification(phoneNumber: string, amount: number, loanId: string): Promise<void>;
    sendPaymentReminder(phoneNumber: string, amount: number, dueDate: string): Promise<void>;
}
