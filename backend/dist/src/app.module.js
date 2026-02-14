"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const Joi = require("joi");
const database_module_1 = require("./shared/database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const loan_module_1 = require("./modules/loan/loan.module");
const payment_module_1 = require("./modules/payment/payment.module");
const marketplace_module_1 = require("./modules/marketplace/marketplace.module");
const risk_module_1 = require("./modules/risk/risk.module");
const admin_module_1 = require("./modules/admin/admin.module");
const notification_module_1 = require("./modules/notification/notification.module");
const audit_module_1 = require("./modules/audit/audit.module");
const compliance_module_1 = require("./modules/compliance/compliance.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.env${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}`,
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string()
                        .valid('development', 'production', 'test', 'staging')
                        .default('development'),
                    PORT: Joi.number().default(3000),
                    FRONTEND_URL: Joi.string().default('http://localhost:3001'),
                    DB_HOST: Joi.string().default('localhost'),
                    DB_PORT: Joi.number().default(5432),
                    DB_USERNAME: Joi.string().default('postgres'),
                    DB_PASSWORD: Joi.string().default('postgres'),
                    DB_DATABASE: Joi.string().required(),
                    JWT_SECRET: Joi.string().required(),
                    JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
                    JWT_REFRESH_EXPIRY: Joi.string().default('7d'),
                    REDIS_HOST: Joi.string().default('localhost'),
                    REDIS_PORT: Joi.number().default(6379),
                    THROTTLE_TTL: Joi.number().default(60),
                    THROTTLE_LIMIT: Joi.number().default(100),
                }),
                validationOptions: {
                    allowUnknown: true,
                    abortEarly: false,
                },
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: config.get('THROTTLE_TTL', 60),
                        limit: config.get('THROTTLE_LIMIT', 100),
                    },
                ],
            }),
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: false,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 10,
                verboseMemoryLeak: true,
                ignoreErrors: false,
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            loan_module_1.LoanModule,
            payment_module_1.PaymentModule,
            marketplace_module_1.MarketplaceModule,
            risk_module_1.RiskModule,
            admin_module_1.AdminModule,
            notification_module_1.NotificationModule,
            audit_module_1.AuditModule,
            compliance_module_1.ComplianceModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map