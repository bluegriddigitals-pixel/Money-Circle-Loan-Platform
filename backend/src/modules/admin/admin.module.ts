import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUser } from './entities/admin-user.entity';
import { AdminAction } from './entities/admin-action.entity';
import { SystemConfig } from './entities/system-config.entity';
import { SystemMaintenance } from './entities/system-maintenance.entity';
import { ApiKey } from './entities/api-key.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser,
      AdminAction,
      SystemConfig,
      SystemMaintenance,
      ApiKey,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}