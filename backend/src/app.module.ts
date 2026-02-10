import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoanModule } from './modules/loan/loan.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { NotificationModule } from './modules/notification/notification.module';

// Configuration
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: configService.get('database.migrationsRun'),
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
      }),
      inject: [ConfigService],
    }),
    
    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('throttler.ttl'),
        limit: config.get('throttler.limit'),
      }),
      inject: [ConfigService],
    }),
    
    // Scheduled tasks
    ScheduleModule.forRoot(),
    
    // Feature modules
    UserModule,
    AuthModule,
    LoanModule,
    PaymentModule,
    MarketplaceModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}