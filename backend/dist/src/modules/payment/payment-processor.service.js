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
var PaymentProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PaymentProcessorService = PaymentProcessorService_1 = class PaymentProcessorService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PaymentProcessorService_1.name);
    }
    async processPayment(data) {
        this.logger.log(`Processing payment: ${data.amount} ${data.currency}`);
        if (this.configService.get('NODE_ENV') !== 'production') {
            return {
                transactionId: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                status: 'succeeded',
            };
        }
        throw new common_1.BadRequestException('Payment processing not configured in production');
    }
    async processPayout(data) {
        this.logger.log(`Processing payout: ${data.amount} ${data.currency}`);
        if (this.configService.get('NODE_ENV') !== 'production') {
            return {
                transactionId: `payout_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                status: 'completed',
            };
        }
        throw new common_1.BadRequestException('Payout processing not configured in production');
    }
    async refundPayment(data) {
        this.logger.log(`Processing refund for transaction: ${data.originalTransactionId}`);
        if (this.configService.get('NODE_ENV') !== 'production') {
            return {
                refundId: `refund_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                status: 'succeeded',
            };
        }
        throw new common_1.BadRequestException('Refund processing not configured in production');
    }
    async verifyPaymentMethod(data) {
        this.logger.log(`Verifying payment method: ${data.paymentMethodId}`);
        if (this.configService.get('NODE_ENV') !== 'production') {
            return {
                verified: true,
                details: {
                    brand: 'visa',
                    last4: '4242',
                    expMonth: 12,
                    expYear: 2026,
                },
            };
        }
        throw new common_1.BadRequestException('Payment method verification not configured in production');
    }
    async parseWebhookEvent(payload, signature, secret) {
        this.logger.log('Parsing webhook event');
        if (this.configService.get('NODE_ENV') !== 'production') {
            return {
                id: `evt_${Date.now()}`,
                type: payload?.type || 'payment_intent.succeeded',
                data: {
                    object: {
                        id: `pi_${Date.now()}`,
                        amount: payload?.amount || 1000,
                        currency: payload?.currency || 'usd',
                        status: 'succeeded',
                        metadata: payload?.metadata || {},
                    },
                },
                created: Math.floor(Date.now() / 1000),
            };
        }
        throw new common_1.BadRequestException('Webhook parsing not configured in production');
    }
    async handleWebhookEvent(event) {
        this.logger.log(`Handling webhook event: ${event.type}`);
        this.logger.debug(`Webhook event type: ${event.type}, ID: ${event.id}`);
        if (this.configService.get('NODE_ENV') !== 'production') {
            return {
                received: true,
                handled: true,
            };
        }
        switch (event.type) {
            case 'payment_intent.succeeded':
                this.logger.log(`Payment succeeded: ${event.data.object.id}`);
                break;
            case 'payment_intent.payment_failed':
                this.logger.log(`Payment failed: ${event.data.object.id}`);
                break;
            case 'payout.paid':
                this.logger.log(`Payout completed: ${event.data.object.id}`);
                break;
            case 'payout.failed':
                this.logger.log(`Payout failed: ${event.data.object.id}`);
                break;
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }
        return {
            received: true,
            handled: true,
        };
    }
    async healthCheck() {
        this.logger.log('Payment processor health check');
        if (this.configService.get('NODE_ENV') !== 'production') {
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
            };
        }
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.PaymentProcessorService = PaymentProcessorService;
exports.PaymentProcessorService = PaymentProcessorService = PaymentProcessorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentProcessorService);
//# sourceMappingURL=payment-processor.service.js.map