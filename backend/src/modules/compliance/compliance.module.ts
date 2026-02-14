import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { Kyc } from './entities/kyc.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { ComplianceCheck } from './entities/compliance-check.entity';
import { SanctionScreening } from './entities/sanction-screening.entity';
import { AmlAlert } from './entities/aml-alert.entity';
import { User } from '../user/entities/user.entity';
import { NotificationModule } from '../notification/notification.module'; // Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kyc,
      KycDocument,
      ComplianceCheck,
      SanctionScreening,
      AmlAlert,
      User,
    ]),
    NotificationModule, // Add this so ComplianceService can use NotificationService
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
