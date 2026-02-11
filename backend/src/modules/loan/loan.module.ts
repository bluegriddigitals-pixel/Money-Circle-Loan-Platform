import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './entities/loan.entity';
import { LoanService } from './loan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Loan])],
  providers: [LoanService],
  exports: [LoanService, TypeOrmModule],
})
export class LoanModule {}