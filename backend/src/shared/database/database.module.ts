import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

// User Module Entities
import { User } from '../../modules/user/entities/user.entity';
import { UserProfile } from '../../modules/user/entities/user-profile.entity';

// Loan Module Entities
import { Loan } from '../../modules/loan/entities/loan.entity';
import { LoanApplication } from '../../modules/loan/entities/loan-application.entity';
import { LoanRepayment } from '../../modules/loan/entities/loan-repayment.entity';
import { LoanDocument } from '../../modules/loan/entities/loan-document.entity';

// Payment Module Entities
import { Transaction } from '../../modules/payment/entities/transaction.entity';
import { Escrow } from '../../modules/payment/entities/escrow.entity';
import { PaymentMethod } from '../../modules/payment/entities/payment-method.entity';

// Marketplace Entities
import { Investment } from '../../modules/marketplace/entities/investment.entity';
import { Listing } from '../../modules/marketplace/entities/listing.entity';
import { Bid } from '../../modules/marketplace/entities/bid.entity';

// Notification Entities
import { Notification } from '../../modules/notification/entities/notification.entity';
import { NotificationPreference } from '../../modules/notification/entities/notification-preference.entity';

// Audit Entities
import { AuditLog } from '../../modules/audit/entities/audit-log.entity';

// Compliance Entities
import { Kyc } from '../../modules/compliance/entities/kyc.entity';
import { KycDocument } from '../../modules/compliance/entities/kyc-document.entity';
import { ComplianceCheck } from '../../modules/compliance/entities/compliance-check.entity';

// Risk Entities
import { RiskAssessment } from '../../modules/risk/entities/risk-assessment.entity';
import { CreditScore } from '../../modules/risk/entities/credit-score.entity';
import { RiskFactor } from '../../modules/risk/entities/risk-factor.entity';

// Admin Entities
import { SystemConfig } from '../../modules/admin/entities/system-config.entity';
import { SystemLog } from '../../modules/admin/entities/system-log.entity';
import { AdminAction } from '../../modules/admin/entities/admin-action.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          
          // Entities
          entities: [
            User,
            UserProfile,
            Loan,
            LoanApplication,
            LoanRepayment,
            LoanDocument,
            Transaction,
            Escrow,
            PaymentMethod,
            Investment,
            Listing,
            Bid,
            Notification,
            NotificationPreference,
            AuditLog,
            Kyc,
            KycDocument,
            ComplianceCheck,
            RiskAssessment,
            CreditScore,
            RiskFactor,
            SystemConfig,
            SystemLog,
            AdminAction,
          ],
          
          // Migration settings
          migrations: ['dist/migrations/*.js'],
          migrationsRun: true,
          migrationsTableName: 'migrations',
          
          // Connection settings
          synchronize: configService.get('DB_SYNCHRONIZE', !isProduction),
          logging: configService.get('DB_LOGGING', !isProduction),
          maxQueryExecutionTime: 1000, // 1 second
          
          // Connection pool settings
          poolSize: 10,
          extra: {
            connectionLimit: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          },
          
          // SSL for production
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          
          // Cache settings
          cache: {
            type: 'redis',
            options: {
              host: configService.get('REDIS_HOST'),
              port: configService.get('REDIS_PORT'),
              password: configService.get('REDIS_PASSWORD'),
            },
            duration: 30000, // 30 seconds
            ignoreErrors: true,
          },
          
          // Replication (for production)
          replication: isProduction ? {
            master: {
              host: configService.get('DB_HOST'),
              port: configService.get('DB_PORT'),
              username: configService.get('DB_USERNAME'),
              password: configService.get('DB_PASSWORD'),
              database: configService.get('DB_DATABASE'),
            },
            slaves: [
              {
                host: configService.get('DB_READ_HOST', configService.get('DB_HOST')),
                port: configService.get('DB_READ_PORT', configService.get('DB_PORT')),
                username: configService.get('DB_READ_USERNAME', configService.get('DB_USERNAME')),
                password: configService.get('DB_READ_PASSWORD', configService.get('DB_PASSWORD')),
                database: configService.get('DB_READ_DATABASE', configService.get('DB_DATABASE')),
              },
            ],
            canRetry: true,
            removeNodeErrorCount: 5,
            restoreNodeTimeout: 0,
          } : undefined,
        };
      },
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options);
        await dataSource.initialize();
        return addTransactionalDataSource(dataSource);
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}