import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './entities/loan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan]),
  ],
  controllers: [],
  providers: [],
})
export class LoanModule {}