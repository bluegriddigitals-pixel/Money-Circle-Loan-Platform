import { 
  Controller, Get, Post, Put, Delete, Body, Param, Query, 
  UseGuards, HttpCode, HttpStatus, Request 
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateEscrowAccountDto } from './dto/create-escrow-account.dto';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Controller('payment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Transactions
  @Post('transactions')
async createTransaction(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
  // Combine into a single object
  const data = {
    ...createTransactionDto,
    userId: req.user.id
  };
  return this.paymentService.createTransaction(data);
}

  @Get('transactions')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  async getAllTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentService.getAllTransactions(page, limit);
  }

  @Get('transactions/:id')
  @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
  async getTransaction(@Param('id') id: string) {
    return this.paymentService.getTransaction(id);
  }

  @Get('transactions/user/:userId')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  async getUserTransactions(@Param('userId') userId: string) {
    return this.paymentService.getUserTransactions(userId);
  }

  // Escrow Accounts
  @Post('escrow')
  @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN)
  async createEscrowAccount(@Body() createEscrowAccountDto: CreateEscrowAccountDto) {
    return this.paymentService.createEscrowAccount(createEscrowAccountDto);
  }

  @Get('escrow/:id')
  @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN, UserRole.LENDER)
  async getEscrowAccount(@Param('id') id: string) {
    return this.paymentService.getEscrowAccount(id);
  }

  @Get('escrow/loan/:loanId')
  @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN, UserRole.LENDER)
  async getEscrowByLoan(@Param('loanId') loanId: string) {
    return this.paymentService.getEscrowByLoan(loanId);
  }

  @Put('escrow/:id/freeze')
  @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN)
  async freezeEscrow(@Param('id') id: string, @Body('reason') reason: string) {
    return this.paymentService.freezeEscrow(id, reason);
  }

  @Put('escrow/:id/unfreeze')
  @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN)
  async unfreezeEscrow(@Param('id') id: string) {
    return this.paymentService.unfreezeEscrow(id);
  }

  @Put('escrow/:id/close')
  @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN)
  async closeEscrow(@Param('id') id: string, @Body('reason') reason: string) {
    return this.paymentService.closeEscrow(id, reason);
  }

  // Payment Processing
  @Post('process')
async processPayment(@Body() processPaymentDto: ProcessPaymentDto, @Request() req) {
  const data = {
    ...processPaymentDto,
    userId: req.user.id
  };
  return this.paymentService.processPayment(data);
}

  @Post('refund/:transactionId')
  @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN)
  async refundPayment(
    @Param('transactionId') transactionId: string,
    @Body('amount') amount?: number,
    @Body('reason') reason?: string,
  ) {
    // FIXED: Pass a single object instead of multiple arguments
    return this.paymentService.refundPayment({
      transactionId,
      amount,
      reason,
    });
  }

  // Payouts
  @Post('payouts')
async createPayoutRequest(@Body() createPayoutRequestDto: CreatePayoutRequestDto, @Request() req) {
  const data = {
    ...createPayoutRequestDto,
    userId: req.user.id
  };
  return this.paymentService.createPayoutRequest(data);
}

  @Get('payouts')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  async getAllPayouts() {
    return this.paymentService.getAllPayouts();
  }

  @Get('payouts/user/:userId')
  @Roles(UserRole.LENDER, UserRole.ADMIN)
  async getUserPayouts(@Param('userId') userId: string) {
    return this.paymentService.getUserPayouts(userId);
  }

  @Put('payouts/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN)
  async approvePayout(@Param('id') id: string, @Request() req) {
    return this.paymentService.approvePayout(id, req.user.id);
  }

  // TO THIS:
@Put('payouts/:id/process')
@Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN)
async processPayout(@Param('id') id: string) {
  return this.paymentService.processPayoutRequest(id);
}

  @Put('payouts/:id/reject')
  @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN)
  async rejectPayout(@Param('id') id: string, @Body('reason') reason: string) {
    return this.paymentService.rejectPayout(id, reason);
  }

  // Payment Methods
  @Post('methods')
@Roles(UserRole.BORROWER, UserRole.LENDER)
async createPaymentMethod(@Body() data: any, @Request() req) {
  const paymentData = {
    ...data,
    userId: req.user.id
  };
  return this.paymentService.createPaymentMethod(paymentData);
}

  @Get('methods')
  @Roles(UserRole.BORROWER, UserRole.LENDER)
  async getUserPaymentMethods(@Request() req) {
    return this.paymentService.getUserPaymentMethods(req.user.id);
  }

  @Delete('methods/:id')
  @Roles(UserRole.BORROWER, UserRole.LENDER)
  async removePaymentMethod(@Param('id') id: string, @Request() req) {
    return this.paymentService.removePaymentMethod(id, req.user.id);
  }

  // Webhooks
  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Request() req,
  ) {
    const signature = req.headers['stripe-signature'] || req.headers['signature'];
    return this.paymentService.handleWebhook(provider, payload, signature);
  }

  // Balance & Statistics
  @Get('balance')
  @Roles(UserRole.BORROWER, UserRole.LENDER)
  async getUserBalance(@Request() req) {
    return this.paymentService.getUserBalance(req.user.id);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  async getPaymentStatistics() {
    return this.paymentService.getPaymentStatistics();
  }

  @Get('health')
  async healthCheck() {
    return this.paymentService.healthCheck();
  }
}