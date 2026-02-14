import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { EscrowAccount } from './entities/escrow-account.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PayoutRequest } from './entities/payout-request.entity';
import { Disbursement } from './entities/disbursement.entity';
import { PayoutService } from './payment.service'; // Changed from PaymentService to PayoutService
import { PaymentController } from './payment.controller';
import { TransactionService } from './services/transaction.service';
import { EscrowService } from './services/escrow.service';
import { PayoutService as PayoutRequestService } from './services/payout.service'; // Alias to avoid conflict
import { DisbursementService } from './services/disbursement.service';
import { PaymentMethodService } from './services/payment-method.service';
import { NotificationModule } from '../notification/notification.module';
import { LoanModule } from '../loan/loan.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      EscrowAccount,
      PaymentMethod,
      PayoutRequest,
      Disbursement,
    ]),
    NotificationModule,
    LoanModule,
    UserModule,
  ],
  controllers: [PaymentController],
  providers: [
    PayoutService, // This is the main service from payment.service.ts
    TransactionService,
    EscrowService,
    PayoutRequestService, // This is from services/payout.service.ts (using alias)
    DisbursementService,
    PaymentMethodService,
  ],
  exports: [
    PayoutService,
    TransactionService,
    EscrowService,
    PayoutRequestService,
    DisbursementService,
    PaymentMethodService,
    TypeOrmModule,
  ],
})
export class PaymentModule {}