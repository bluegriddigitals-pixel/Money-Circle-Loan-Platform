"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const typeorm_transactional_1 = require("typeorm-transactional");
const path = require("path");
const typeorm_3 = require("typeorm");
const user_entity_1 = require("../../modules/user/entities/user.entity");
const user_profile_entity_1 = require("../../modules/user/entities/user-profile.entity");
const loan_entity_1 = require("../../modules/loan/entities/loan.entity");
const loan_application_entity_1 = require("../../modules/loan/entities/loan-application.entity");
const loan_repayment_entity_1 = require("../../modules/loan/entities/loan-repayment.entity");
const loan_document_entity_1 = require("../../modules/loan/entities/loan-document.entity");
const loan_collateral_entity_1 = require("../../modules/loan/entities/loan-collateral.entity");
const loan_guarantor_entity_1 = require("../../modules/loan/entities/loan-guarantor.entity");
const transaction_entity_1 = require("../../modules/payment/entities/transaction.entity");
const escrow_account_entity_1 = require("../../modules/payment/entities/escrow-account.entity");
const payment_method_entity_1 = require("../../modules/payment/entities/payment-method.entity");
const payout_request_entity_1 = require("../../modules/payment/entities/payout-request.entity");
const disbursement_entity_1 = require("../../modules/payment/entities/disbursement.entity");
const investment_entity_1 = require("../../modules/marketplace/entities/investment.entity");
const listing_entity_1 = require("../../modules/marketplace/entities/listing.entity");
const bid_entity_1 = require("../../modules/marketplace/entities/bid.entity");
const investment_portfolio_entity_1 = require("../../modules/marketplace/entities/investment-portfolio.entity");
const auto_invest_rule_entity_1 = require("../../modules/marketplace/entities/auto-invest-rule.entity");
const notification_entity_1 = require("../../modules/notification/entities/notification.entity");
const notification_preference_entity_1 = require("../../modules/notification/entities/notification-preference.entity");
const email_template_entity_1 = require("../../modules/notification/entities/email-template.entity");
const sms_log_entity_1 = require("../../modules/notification/entities/sms-log.entity");
const audit_log_entity_1 = require("../../modules/audit/entities/audit-log.entity");
const system_log_entity_1 = require("../../modules/audit/entities/system-log.entity");
const access_log_entity_1 = require("../../modules/audit/entities/access-log.entity");
const kyc_entity_1 = require("../../modules/compliance/entities/kyc.entity");
const kyc_document_entity_1 = require("../../modules/compliance/entities/kyc-document.entity");
const compliance_check_entity_1 = require("../../modules/compliance/entities/compliance-check.entity");
const sanction_screening_entity_1 = require("../../modules/compliance/entities/sanction-screening.entity");
const aml_alert_entity_1 = require("../../modules/compliance/entities/aml-alert.entity");
const risk_assessment_entity_1 = require("../../modules/risk/entities/risk-assessment.entity");
const credit_score_entity_1 = require("../../modules/risk/entities/credit-score.entity");
const risk_factor_entity_1 = require("../../modules/risk/entities/risk-factor.entity");
const fraud_detection_entity_1 = require("../../modules/risk/entities/fraud-detection.entity");
const behavioral_analysis_entity_1 = require("../../modules/risk/entities/behavioral-analysis.entity");
const system_config_entity_1 = require("../../modules/admin/entities/system-config.entity");
const admin_user_entity_1 = require("../../modules/admin/entities/admin-user.entity");
const admin_action_entity_1 = require("../../modules/admin/entities/admin-action.entity");
const system_maintenance_entity_1 = require("../../modules/admin/entities/system-maintenance.entity");
const api_key_entity_1 = require("../../modules/admin/entities/api-key.entity");
const financial_report_entity_1 = require("../../modules/report/entities/financial-report.entity");
const user_report_entity_1 = require("../../modules/report/entities/user-report.entity");
const loan_report_entity_1 = require("../../modules/report/entities/loan-report.entity");
const risk_report_entity_1 = require("../../modules/report/entities/risk-report.entity");
const user_analytics_entity_1 = require("../../modules/analytics/entities/user-analytics.entity");
const loan_analytics_entity_1 = require("../../modules/analytics/entities/loan-analytics.entity");
const platform_analytics_entity_1 = require("../../modules/analytics/entities/platform-analytics.entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const logger = new common_1.Logger('DatabaseModule');
                    const isProduction = configService.get('NODE_ENV') === 'production';
                    const isTest = configService.get('NODE_ENV') === 'test';
                    const dbConfig = {
                        type: 'postgres',
                        host: configService.get('DB_HOST', 'localhost'),
                        port: configService.get('DB_PORT', 5432),
                        username: configService.get('DB_USERNAME', 'postgres'),
                        password: configService.get('DB_PASSWORD', 'postgres'),
                        database: configService.get('DB_DATABASE', 'moneycircle'),
                        entities: [
                            user_entity_1.User,
                            user_profile_entity_1.UserProfile,
                            loan_entity_1.Loan,
                            loan_application_entity_1.LoanApplication,
                            loan_repayment_entity_1.LoanRepayment,
                            loan_document_entity_1.LoanDocument,
                            loan_collateral_entity_1.LoanCollateral,
                            loan_guarantor_entity_1.LoanGuarantor,
                            transaction_entity_1.Transaction,
                            escrow_account_entity_1.EscrowAccount,
                            payment_method_entity_1.PaymentMethod,
                            payout_request_entity_1.PayoutRequest,
                            disbursement_entity_1.Disbursement,
                            investment_entity_1.Investment,
                            listing_entity_1.Listing,
                            bid_entity_1.Bid,
                            investment_portfolio_entity_1.InvestmentPortfolio,
                            auto_invest_rule_entity_1.AutoInvestRule,
                            notification_entity_1.Notification,
                            notification_preference_entity_1.NotificationPreference,
                            email_template_entity_1.EmailTemplate,
                            sms_log_entity_1.SmsLog,
                            audit_log_entity_1.AuditLog,
                            system_log_entity_1.SystemLog,
                            access_log_entity_1.AccessLog,
                            kyc_entity_1.Kyc,
                            kyc_document_entity_1.KycDocument,
                            compliance_check_entity_1.ComplianceCheck,
                            sanction_screening_entity_1.SanctionScreening,
                            aml_alert_entity_1.AmlAlert,
                            risk_assessment_entity_1.RiskAssessment,
                            credit_score_entity_1.CreditScore,
                            risk_factor_entity_1.RiskFactor,
                            fraud_detection_entity_1.FraudDetection,
                            behavioral_analysis_entity_1.BehavioralAnalysis,
                            system_config_entity_1.SystemConfig,
                            admin_user_entity_1.AdminUser,
                            admin_action_entity_1.AdminAction,
                            system_maintenance_entity_1.SystemMaintenance,
                            api_key_entity_1.ApiKey,
                            financial_report_entity_1.FinancialReport,
                            user_report_entity_1.UserReport,
                            loan_report_entity_1.LoanReport,
                            risk_report_entity_1.RiskReport,
                            user_analytics_entity_1.UserAnalytics,
                            loan_analytics_entity_1.LoanAnalytics,
                            platform_analytics_entity_1.PlatformAnalytics,
                        ],
                        migrations: [path.join(__dirname, '..', '..', 'migrations', '*.{js,ts}')],
                        migrationsTableName: 'migrations_history',
                        migrationsRun: configService.get('DB_MIGRATIONS_RUN', true),
                        migrationsTransactionMode: 'each',
                        synchronize: configService.get('DB_SYNCHRONIZE', !isProduction && !isTest),
                        logging: configService.get('DB_LOGGING', !isProduction),
                        logger: isProduction ? 'advanced-console' : 'debug',
                        maxQueryExecutionTime: configService.get('DB_MAX_QUERY_TIME', 1000),
                        poolSize: configService.get('DB_POOL_SIZE', 10),
                        extra: {
                            connectionTimeoutMillis: configService.get('DB_CONNECTION_TIMEOUT', 5000),
                            idleTimeoutMillis: configService.get('DB_IDLE_TIMEOUT', 30000),
                            max: configService.get('DB_MAX_CONNECTIONS', 20),
                        },
                        namingStrategy: new typeorm_3.DefaultNamingStrategy(),
                        ssl: isProduction ? {
                            rejectUnauthorized: false,
                            ca: configService.get('DB_SSL_CA'),
                            key: configService.get('DB_SSL_KEY'),
                            cert: configService.get('DB_SSL_CERT'),
                        } : false,
                        cache: {
                            type: 'redis',
                            options: {
                                host: configService.get('REDIS_HOST', 'localhost'),
                                port: configService.get('REDIS_PORT', 6379),
                                password: configService.get('REDIS_PASSWORD'),
                                db: configService.get('REDIS_DB', 0),
                            },
                            duration: configService.get('DB_CACHE_DURATION', 30000),
                            ignoreErrors: true,
                        },
                        replication: isProduction ? {
                            master: {
                                host: configService.get('DB_MASTER_HOST') || configService.get('DB_HOST'),
                                port: configService.get('DB_MASTER_PORT') || configService.get('DB_PORT'),
                                username: configService.get('DB_MASTER_USERNAME') || configService.get('DB_USERNAME'),
                                password: configService.get('DB_MASTER_PASSWORD') || configService.get('DB_PASSWORD'),
                                database: configService.get('DB_MASTER_DATABASE') || configService.get('DB_DATABASE'),
                            },
                            slaves: configService.get('DB_REPLICA_HOSTS', '').split(',').filter(Boolean).map((host) => ({
                                host: host.trim(),
                                port: configService.get('DB_REPLICA_PORT', configService.get('DB_PORT')),
                                username: configService.get('DB_REPLICA_USERNAME', configService.get('DB_USERNAME')),
                                password: configService.get('DB_REPLICA_PASSWORD', configService.get('DB_PASSWORD')),
                                database: configService.get('DB_REPLICA_DATABASE', configService.get('DB_DATABASE')),
                            })),
                            canRetry: true,
                            removeNodeErrorCount: 5,
                            restoreNodeTimeout: 0,
                            selector: 'RR',
                        } : undefined,
                        entitySkipConstructor: false,
                        entityPrefix: configService.get('DB_TABLE_PREFIX', ''),
                        relationLoadStrategy: 'query',
                        applicationName: 'MoneyCircle-Backend',
                        installExtensions: true,
                        useUTC: true,
                    };
                    logger.log(`Database configuration loaded for ${configService.get('NODE_ENV')} environment`);
                    logger.debug(`Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
                    return dbConfig;
                },
                dataSourceFactory: async (options) => {
                    const logger = new common_1.Logger('DataSourceFactory');
                    try {
                        const dataSource = new typeorm_2.DataSource(options);
                        await dataSource.initialize();
                        logger.log('Database connection established successfully');
                        return (0, typeorm_transactional_1.addTransactionalDataSource)(dataSource);
                    }
                    catch (error) {
                        logger.error('Failed to establish database connection:', error);
                        throw error;
                    }
                },
            }),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map