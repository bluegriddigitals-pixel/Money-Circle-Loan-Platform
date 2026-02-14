import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { EscrowAccount } from './entities/escrow-account.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PayoutRequest } from './entities/payout-request.entity';
import { Disbursement } from './entities/disbursement.entity';
import { PayoutService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TransactionService } from './services/transaction.service';
import { EscrowService } from './services/escrow.service';
import { DisbursementService } from './services/disbursement.service';
import { PaymentMethodService } from './services/payment-method.service';
import { PaymentProcessorService } from './payment-processor.service'; // Add this
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
    PayoutService,
    TransactionService,
    EscrowService,
    DisbursementService,
    PaymentMethodService,
    PaymentProcessorService, // Add this
  ],
  exports: [
    PayoutService,
    TransactionService,
    EscrowService,
    DisbursementService,
    PaymentMethodService,
    PaymentProcessorService, // Add this if other modules need it
    TypeOrmModule,
  ],
})
export class PaymentModule {}
