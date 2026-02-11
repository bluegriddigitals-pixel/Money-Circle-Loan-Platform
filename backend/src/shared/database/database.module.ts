import { Module, Global, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// User Module Entities
import { User } from '../../modules/user/entities/user.entity';
import { UserProfile } from '../../modules/user/entities/user-profile.entity';

// Loan Module Entities
import { Loan } from "../../modules/loan/entities/loan.entity";
import { LoanApplication } from "../../modules/loan/entities/loan-application.entity";
import { LoanRepayment } from "../../modules/loan/entities/loan-repayment.entity";
import { LoanDocument } from "../../modules/loan/entities/loan-document.entity";
import { LoanCollateral } from "../../modules/loan/entities/loan-collateral.entity";
import { LoanGuarantor } from "../../modules/loan/entities/loan-guarantor.entity";

// Payment Module Entities
import { Transaction } from "../../modules/payment/entities/transaction.entity";
import { EscrowAccount } from "../../modules/payment/entities/escrow-account.entity";
import { PaymentMethod } from "../../modules/payment/entities/payment-method.entity";
import { PayoutRequest } from "../../modules/payment/entities/payout-request.entity";
import { Disbursement } from "../../modules/payment/entities/disbursement.entity";

// Marketplace Entities
import { Investment } from "../../modules/marketplace/entities/investment.entity";
import { Listing } from "../../modules/marketplace/entities/listing.entity";
import { Bid } from "../../modules/marketplace/entities/bid.entity";
import { InvestmentPortfolio } from "../../modules/marketplace/entities/investment-portfolio.entity";
import { AutoInvestRule } from "../../modules/marketplace/entities/auto-invest-rule.entity";

// Notification Entities
import { Notification } from "../../modules/notification/entities/notification.entity";
import { NotificationPreference } from "../../modules/notification/entities/notification-preference.entity";
import { EmailTemplate } from "../../modules/notification/entities/email-template.entity";
import { SmsLog } from "../../modules/notification/entities/sms-log.entity";

// Audit Entities
import { AuditLog } from "../../modules/audit/entities/audit-log.entity";
import { SystemLog } from "../../modules/audit/entities/system-log.entity";
import { AccessLog } from "../../modules/audit/entities/access-log.entity";

// Compliance Entities
import { Kyc } from "../../modules/compliance/entities/kyc.entity";
import { KycDocument } from "../../modules/compliance/entities/kyc-document.entity";
import { ComplianceCheck } from "../../modules/compliance/entities/compliance-check.entity";
import { SanctionScreening } from "../../modules/compliance/entities/sanction-screening.entity";
import { AmlAlert } from "../../modules/compliance/entities/aml-alert.entity";

// Risk Entities
import { RiskAssessment } from "../../modules/risk/entities/risk-assessment.entity";
import { CreditScore } from "../../modules/risk/entities/credit-score.entity";
import { RiskFactor } from "../../modules/risk/entities/risk-factor.entity";
import { FraudDetection } from "../../modules/risk/entities/fraud-detection.entity";
import { BehavioralAnalysis } from "../../modules/risk/entities/behavioral-analysis.entity";

// Admin Entities
import { SystemConfig } from "../../modules/admin/entities/system-config.entity";
import { AdminUser } from "../../modules/admin/entities/admin-user.entity";
import { AdminAction } from "../../modules/admin/entities/admin-action.entity";
import { SystemMaintenance } from "../../modules/admin/entities/system-maintenance.entity";
import { ApiKey } from "../../modules/admin/entities/api-key.entity";

// Report Entities
import { FinancialReport } from "../../modules/report/entities/financial-report.entity";
import { UserReport } from "../../modules/report/entities/user-report.entity";
import { LoanReport } from "../../modules/report/entities/loan-report.entity";
import { RiskReport } from "../../modules/report/entities/risk-report.entity";

// Analytics Entities
import { UserAnalytics } from "../../modules/analytics/entities/user-analytics.entity";
import { LoanAnalytics } from "../../modules/analytics/entities/loan-analytics.entity";
import { PlatformAnalytics } from "../../modules/analytics/entities/platform-analytics.entity";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        const isProduction = configService.get('NODE_ENV') === 'production';
        const isTest = configService.get('NODE_ENV') === 'test';
        
        const dbConfig = {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_DATABASE', 'moneycircle'),
          
          // All entities
          entities: [
            User,
            UserProfile,
            Loan,
            LoanApplication,
            LoanRepayment,
            LoanDocument,
            LoanCollateral,
            LoanGuarantor,
            Transaction,
            EscrowAccount,
            PaymentMethod,
            PayoutRequest,
            Disbursement,
            Investment,
            Listing,
            Bid,
            InvestmentPortfolio,
            AutoInvestRule,
            Notification,
            NotificationPreference,
            EmailTemplate,
            SmsLog,
            AuditLog,
            SystemLog,
            AccessLog,
            Kyc,
            KycDocument,
            ComplianceCheck,
            SanctionScreening,
            AmlAlert,
            RiskAssessment,
            CreditScore,
            RiskFactor,
            FraudDetection,
            BehavioralAnalysis,
            SystemConfig,
            AdminUser,
            AdminAction,
            SystemMaintenance,
            ApiKey,
            FinancialReport,
            UserReport,
            LoanReport,
            RiskReport,
            UserAnalytics,
            LoanAnalytics,
            PlatformAnalytics,
          ],
          
          // Migrations
          migrations: [path.join(__dirname, '..', '..', 'migrations', '*.{js,ts}')],
          migrationsTableName: 'migrations_history',
          migrationsRun: configService.get<boolean>('DB_MIGRATIONS_RUN', true),
          migrationsTransactionMode: 'each',
          
          // Connection settings
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', !isProduction && !isTest),
          logging: configService.get<boolean>('DB_LOGGING', !isProduction),
          logger: isProduction ? 'advanced-console' : 'debug',
          maxQueryExecutionTime: configService.get<number>('DB_MAX_QUERY_TIME', 1000),
          
          // Connection pool
          poolSize: configService.get<number>('DB_POOL_SIZE', 10),
          extra: {
            connectionTimeoutMillis: configService.get<number>('DB_CONNECTION_TIMEOUT', 5000),
            idleTimeoutMillis: configService.get<number>('DB_IDLE_TIMEOUT', 30000),
            max: configService.get<number>('DB_MAX_CONNECTIONS', 20),
          },
          
          // Naming strategy
          namingStrategy: new SnakeNamingStrategy(),
          
          // SSL for production
          ssl: isProduction ? {
            rejectUnauthorized: false,
            ca: configService.get<string>('DB_SSL_CA'),
            key: configService.get<string>('DB_SSL_KEY'),
            cert: configService.get<string>('DB_SSL_CERT'),
          } : false,
          
          // Cache
          cache: {
            type: 'redis',
            options: {
              host: configService.get<string>('REDIS_HOST', 'localhost'),
              port: configService.get<number>('REDIS_PORT', 6379),
              password: configService.get<string>('REDIS_PASSWORD'),
              db: configService.get<number>('REDIS_DB', 0),
            },
            duration: configService.get<number>('DB_CACHE_DURATION', 30000),
            ignoreErrors: true,
          },
          
          // Replication (for production)
          replication: isProduction ? {
            master: {
              host: configService.get<string>('DB_MASTER_HOST') || configService.get<string>('DB_HOST'),
              port: configService.get<number>('DB_MASTER_PORT') || configService.get<number>('DB_PORT'),
              username: configService.get<string>('DB_MASTER_USERNAME') || configService.get<string>('DB_USERNAME'),
              password: configService.get<string>('DB_MASTER_PASSWORD') || configService.get<string>('DB_PASSWORD'),
              database: configService.get<string>('DB_MASTER_DATABASE') || configService.get<string>('DB_DATABASE'),
            },
            slaves: configService.get<string>('DB_REPLICA_HOSTS', '').split(',').filter(Boolean).map((host, index) => ({
              host: host.trim(),
              port: configService.get<number>('DB_REPLICA_PORT', configService.get<number>('DB_PORT')),
              username: configService.get<string>('DB_REPLICA_USERNAME', configService.get<string>('DB_USERNAME')),
              password: configService.get<string>('DB_REPLICA_PASSWORD', configService.get<string>('DB_PASSWORD')),
              database: configService.get<string>('DB_REPLICA_DATABASE', configService.get<string>('DB_DATABASE')),
            })),
            canRetry: true,
            removeNodeErrorCount: 5,
            restoreNodeTimeout: 0,
            selector: 'RR', // Round Robin
          } : undefined,
          
          // Entity metadata
          entitySkipConstructor: false,
          entityPrefix: configService.get<string>('DB_TABLE_PREFIX', ''),
          relationLoadStrategy: 'query',
          
          // Drivers specific
          applicationName: 'MoneyCircle-Backend',
          installExtensions: true,
          useUTC: true,
        };
        
        logger.log(`Database configuration loaded for ${configService.get('NODE_ENV')} environment`);
        logger.debug(`Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
        
        return dbConfig;
      },
      dataSourceFactory: async (options) => {
        const logger = new Logger('DataSourceFactory');
        try {
          const dataSource = new DataSource(options);
          await dataSource.initialize();
          
          logger.log('Database connection established successfully');
          
          // Initialize transactional data source
          return addTransactionalDataSource(dataSource);
        } catch (error) {
          logger.error('Failed to establish database connection:', error);
          throw error;
        }
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}