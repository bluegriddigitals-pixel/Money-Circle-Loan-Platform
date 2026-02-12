import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kyc } from './entities/kyc.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { ComplianceCheck } from './entities/compliance-check.entity';
import { SanctionScreening } from './entities/sanction-screening.entity';
import { AmlAlert } from './entities/aml-alert.entity';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kyc,
      KycDocument,
      ComplianceCheck,
      SanctionScreening,
      AmlAlert,
    ]),
    UserModule,
    NotificationModule,
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService, TypeOrmModule],
})
export class ComplianceModule {}