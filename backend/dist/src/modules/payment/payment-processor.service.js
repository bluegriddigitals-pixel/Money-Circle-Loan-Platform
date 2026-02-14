"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PaymentProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessorService = void 0;
const common_1 = require("@nestjs/common");
let PaymentProcessorService = PaymentProcessorService_1 = class PaymentProcessorService {
    constructor() {
        this.logger = new common_1.Logger(PaymentProcessorService_1.name);
    }
    async processPayment(data) {
        this.logger.log(`Processing payment: ${data.amount} ${data.currency}`);
        return { transactionId: `proc_${Date.now()}` };
    }
    async refundPayment(data) {
        this.logger.log(`Processing refund: ${data.amount} for transaction ${data.originalTransactionId}`);
        return { refundId: `ref_${Date.now()}` };
    }
    async processPayout(data) {
        this.logger.log(`Processing payout: ${data.amount} ${data.currency}`);
        return { transactionId: `payout_${Date.now()}` };
    }
    async healthCheck() {
        return { status: 'healthy' };
    }
    async parseWebhookEvent(rawPayload, signature) {
        this.logger.log(`Parsing webhook event with signature: ${signature.substring(0, 10)}...`);
        return JSON.parse(rawPayload);
    }
    async handleWebhookEvent(event) {
        this.logger.log(`Handling webhook event: ${event.type || 'unknown'}`);
    }
    async tokenizePaymentMethod(data) {
        this.logger.log(`Tokenizing payment method for: ${data.holderName}`);
        return {
            token: `tok_${Date.now()}`,
            last4: data.cardNumber.slice(-4),
            brand: this.detectCardBrand(data.cardNumber),
        };
    }
    async createCustomer(email) {
        this.logger.log(`Creating customer: ${email}`);
        return `cus_${Date.now()}`;
    }
    async simulatePayment(amount, success = true) {
        this.logger.log(`Simulating payment: $${amount}, success: ${success}`);
        if (success) {
            return {
                success: true,
                transactionId: `sim_${Date.now()}`,
                amount,
                status: 'succeeded',
            };
        }
        else {
            throw new Error('Payment simulation failed');
        }
    }
    async simulatePayout(amount, success = true) {
        this.logger.log(`Simulating payout: $${amount}, success: ${success}`);
        if (success) {
            return {
                success: true,
                payoutId: `payout_sim_${Date.now()}`,
                amount,
                status: 'succeeded',
            };
        }
        else {
            throw new Error('Payout simulation failed');
        }
    }
    detectCardBrand(cardNumber) {
        if (cardNumber.startsWith('4'))
            return 'visa';
        if (cardNumber.startsWith('5'))
            return 'mastercard';
        if (cardNumber.startsWith('3'))
            return 'amex';
        if (cardNumber.startsWith('6'))
            return 'discover';
        return 'unknown';
    }
};
exports.PaymentProcessorService = PaymentProcessorService;
exports.PaymentProcessorService = PaymentProcessorService = PaymentProcessorService_1 = __decorate([
    (0, common_1.Injectable)()
], PaymentProcessorService);
//# sourceMappingURL=payment-processor.service.js.map