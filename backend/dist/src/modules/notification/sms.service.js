"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
let SmsService = SmsService_1 = class SmsService {
    constructor() {
        this.logger = new common_1.Logger(SmsService_1.name);
    }
    async sendSms(phoneNumber, message) {
        this.logger.log(`SMS to ${phoneNumber}: ${message}`);
        return Promise.resolve();
    }
    async sendVerificationCode(phoneNumber, code) {
        const message = `Your Money Circle verification code is: ${code}`;
        await this.sendSms(phoneNumber, message);
    }
    async sendTransactionAlert(phoneNumber, amount, type) {
        const message = `Money Circle: ${type} of $${amount} processed successfully.`;
        await this.sendSms(phoneNumber, message);
    }
    async sendLoanDisbursementNotification(phoneNumber, amount, loanId) {
        const message = `Money Circle: Your loan of $${amount} (ID: ${loanId}) has been disbursed to your account.`;
        await this.sendSms(phoneNumber, message);
    }
    async sendPaymentReminder(phoneNumber, amount, dueDate) {
        const message = `Money Circle: Payment of $${amount} is due on ${dueDate}. Please ensure sufficient funds.`;
        await this.sendSms(phoneNumber, message);
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)()
], SmsService);
//# sourceMappingURL=sms.service.js.map