"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const transaction_entity_1 = require("./entities/transaction.entity");
const escrow_account_entity_1 = require("./entities/escrow-account.entity");
const payment_method_entity_1 = require("./entities/payment-method.entity");
const payout_request_entity_1 = require("./entities/payout-request.entity");
const disbursement_entity_1 = require("./entities/disbursement.entity");
const payment_service_1 = require("./payment.service");
const payment_controller_1 = require("./payment.controller");
const transaction_service_1 = require("./services/transaction.service");
const escrow_service_1 = require("./services/escrow.service");
const disbursement_service_1 = require("./services/disbursement.service");
const payment_method_service_1 = require("./services/payment-method.service");
const payment_processor_service_1 = require("./payment-processor.service");
const notification_module_1 = require("../notification/notification.module");
const loan_module_1 = require("../loan/loan.module");
const user_module_1 = require("../user/user.module");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                transaction_entity_1.Transaction,
                escrow_account_entity_1.EscrowAccount,
                payment_method_entity_1.PaymentMethod,
                payout_request_entity_1.PayoutRequest,
                disbursement_entity_1.Disbursement,
            ]),
            notification_module_1.NotificationModule,
            loan_module_1.LoanModule,
            user_module_1.UserModule,
        ],
        controllers: [payment_controller_1.PaymentController],
        providers: [
            payment_service_1.PayoutService,
            transaction_service_1.TransactionService,
            escrow_service_1.EscrowService,
            disbursement_service_1.DisbursementService,
            payment_method_service_1.PaymentMethodService,
            payment_processor_service_1.PaymentProcessorService,
        ],
        exports: [
            payment_service_1.PayoutService,
            transaction_service_1.TransactionService,
            escrow_service_1.EscrowService,
            disbursement_service_1.DisbursementService,
            payment_method_service_1.PaymentMethodService,
            payment_processor_service_1.PaymentProcessorService,
            typeorm_1.TypeOrmModule,
        ],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map