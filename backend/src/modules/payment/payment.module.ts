import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { EscrowAccount } from './entities/escrow-account.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PayoutRequest } from './entities/payout-request.entity';
import { Disbursement } from './entities/disbursement.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TransactionService } from './services/transaction.service';
import { EscrowService } from './services/escrow.service';
import { PayoutService } from './services/payout.service';
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
    PaymentService,
    TransactionService,
    EscrowService,
    PayoutService,
    DisbursementService,
    PaymentMethodService,
  ],
  exports: [
    PaymentService,
    TransactionService,
    EscrowService,
    PayoutService,
    DisbursementService,
    PaymentMethodService,
    TypeOrmModule,
  ],
})
export class PaymentModule {}