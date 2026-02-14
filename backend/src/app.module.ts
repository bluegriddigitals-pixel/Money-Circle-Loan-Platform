import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as Joi from 'joi';

// Core modules
import { DatabaseModule } from './shared/database/database.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LoanModule } from './modules/loan/loan.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { RiskModule } from './modules/risk/risk.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuditModule } from './modules/audit/audit.module';
import { ComplianceModule } from './modules/compliance/compliance.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'staging')
          .default('development'),
        PORT: Joi.number().default(3000),
        HOST: Joi.string().default('0.0.0.0'),
        
        // Database
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.boolean().default(false),
        DB_LOGGING: Joi.boolean().default(false),
        
        // JWT
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        
        // Bcrypt
        BCRYPT_SALT_ROUNDS: Joi.number().default(10),
        
        // CORS
        CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
        
        // Redis (for caching and rate limiting)
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow(''),
        REDIS_TTL: Joi.number().default(3600),
        
        // Payment Gateway
        PAYMENT_GATEWAY_API_KEY: Joi.string().required(),
        PAYMENT_GATEWAY_SECRET: Joi.string().required(),
        
        // Email Service
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().default(587),
        SMTP_USER: Joi.string().required(),
        SMTP_PASSWORD: Joi.string().required(),
        EMAIL_FROM: Joi.string().required(),
        
        // External APIs
        CREDIT_BUREAU_API_KEY: Joi.string(),
        ID_VERIFICATION_API_KEY: Joi.string(),
        AML_CHECK_API_KEY: Joi.string(),
        
        // Security
        RATE_LIMIT_TTL: Joi.number().default(60),
        RATE_LIMIT_MAX: Joi.number().default(100),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    
    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('RATE_LIMIT_TTL', 60),
          limit: config.get('RATE_LIMIT_MAX', 100),
        },
      ],
    }),
    
    // Task Scheduling
    ScheduleModule.forRoot(),
    
    // Event Emitter
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    
    // Database
    DatabaseModule,
    
    // Feature Modules
    AuthModule,
    UserModule,
    LoanModule,
    PaymentModule,
    MarketplaceModule,
    RiskModule,
    AdminModule,
    NotificationModule,
    AuditModule,
    ComplianceModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}