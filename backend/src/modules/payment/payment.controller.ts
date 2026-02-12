import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
    Req,
    Res,
    Headers,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
    ApiBody,
    ApiHeader,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { PaymentProcessorService } from './payment-processor.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { CreateEscrowAccountDto } from './dto/create-escrow-account.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { CreateDisbursementDto } from './dto/create-disbursement.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';
import { ScheduleDisbursementDto } from './dto/schedule-disbursement.dto';
import { RefundTransactionDto } from './dto/refund-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { EscrowAccount } from './entities/escrow-account.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PayoutRequest } from './entities/payout-request.entity';
import { Disbursement } from './entities/disbursement.entity';
import { TransactionStatus, TransactionType } from './enums/transaction.enum';
import { PayoutRequestStatus } from './enums/payout.enum';

@ApiTags('Payment')
@Controller('payment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly paymentProcessorService: PaymentProcessorService,
    ) { }

    // ============================================
    // TRANSACTION ENDPOINTS
    // ============================================

    @Post('transactions')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new transaction' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Transaction created successfully', type: Transaction })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request data' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    async createTransaction(
        @Body() createTransactionDto: CreateTransactionDto,
        @Req() req: any,
    ): Promise<Transaction> {
        // Add user ID from request if not provided
        if (!createTransactionDto.userId && req.user) {
            createTransactionDto.userId = req.user.id;
        }

        return this.paymentService.createTransaction(createTransactionDto);
    }

    @Post('process-payment')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Process a payment' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Payment processed successfully', type: Transaction })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Payment processing failed' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    async processPayment(
        @Body() processPaymentDto: ProcessPaymentDto,
        @Req() req: any,
    ): Promise<Transaction> {
        // Add user ID from request if not provided
        if (!processPaymentDto.userId && req.user) {
            processPaymentDto.userId = req.user.id;
        }

        return this.paymentService.processPayment(processPaymentDto);
    }

    @Get('transactions/:id')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get a transaction by ID' })
    @ApiParam({ name: 'id', description: 'Transaction ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transaction retrieved successfully', type: Transaction })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
    async getTransaction(@Param('id', ParseUUIDPipe) id: string): Promise<Transaction> {
        return this.paymentService.getTransaction(id);
    }

    @Get('loans/:loanId/transactions')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get transactions for a loan' })
    @ApiParam({ name: 'loanId', description: 'Loan ID', type: String })
    @ApiQuery({ name: 'type', enum: TransactionType, required: false })
    @ApiQuery({ name: 'status', enum: TransactionStatus, required: false })
    @ApiQuery({ name: 'startDate', type: Date, required: false })
    @ApiQuery({ name: 'endDate', type: Date, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiQuery({ name: 'offset', type: Number, required: false })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transactions retrieved successfully' })
    async getLoanTransactions(
        @Param('loanId', ParseUUIDPipe) loanId: string,
        @Query('type') type?: TransactionType,
        @Query('status') status?: TransactionStatus,
        @Query('startDate') startDate?: Date,
        @Query('endDate') endDate?: Date,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ): Promise<{ transactions: Transaction[]; total: number }> {
        return this.paymentService.getTransactionsByLoan(loanId, {
            type,
            status,
            startDate,
            endDate,
            limit: limit ? parseInt(limit.toString(), 10) : undefined,
            offset: offset ? parseInt(offset.toString(), 10) : undefined,
        });
    }

    @Post('transactions/:id/refund')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Refund a transaction' })
    @ApiParam({ name: 'id', description: 'Transaction ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transaction refunded successfully', type: Transaction })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Transaction cannot be refunded' })
    async refundTransaction(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() refundTransactionDto: RefundTransactionDto,
    ): Promise<Transaction> {
        return this.paymentService.refundTransaction(id, refundTransactionDto.reason);
    }

    // ============================================
    // ESCROW ACCOUNT ENDPOINTS
    // ============================================

    @Post('escrow-accounts')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Create a new escrow account' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Escrow account created successfully', type: EscrowAccount })
    async createEscrowAccount(
        @Body() createEscrowAccountDto: CreateEscrowAccountDto,
    ): Promise<EscrowAccount> {
        return this.paymentService.createEscrowAccount(createEscrowAccountDto);
    }

    @Get('escrow-accounts/:id')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get an escrow account by ID' })
    @ApiParam({ name: 'id', description: 'Escrow account ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Escrow account retrieved successfully', type: EscrowAccount })
    async getEscrowAccount(@Param('id', ParseUUIDPipe) id: string): Promise<EscrowAccount> {
        return this.paymentService.getEscrowAccount(id);
    }

    @Get('loans/:loanId/escrow-accounts')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get escrow accounts for a loan' })
    @ApiParam({ name: 'loanId', description: 'Loan ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Escrow accounts retrieved successfully', type: [EscrowAccount] })
    async getLoanEscrowAccounts(
        @Param('loanId', ParseUUIDPipe) loanId: string,
    ): Promise<EscrowAccount[]> {
        return this.paymentService.getEscrowAccountByLoan(loanId);
    }

    @Post('escrow-accounts/:id/deposit')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Deposit funds to escrow account' })
    @ApiParam({ name: 'id', description: 'Escrow account ID', type: String })
    @ApiBody({
        schema: {
            properties: {
                amount: { type: 'number' },
                description: { type: 'string' }
            },
            required: ['amount'] // ✅ Move required to schema level
        }
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Deposit successful', type: Transaction })
    async depositToEscrow(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('amount') amount: number,
        @Body('description') description?: string,
    ): Promise<Transaction> {
        return this.paymentService.depositToEscrow(id, amount, description);
    }

    @Post('escrow-accounts/:id/withdraw')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Withdraw funds from escrow account' })
    @ApiParam({ name: 'id', description: 'Escrow account ID', type: String })
    @ApiBody({
        schema: {
            properties: {
                amount: { type: 'number' },
                description: { type: 'string' }
            },
            required: ['amount']
        }
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Withdrawal successful', type: Transaction })
    async withdrawFromEscrow(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('amount') amount: number,
        @Body('description') description?: string,
    ): Promise<Transaction> {
        return this.paymentService.withdrawFromEscrow(id, amount, description);
    }

    @Post('escrow-accounts/transfer')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Transfer funds between escrow accounts' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transfer successful' })
    async transferFunds(@Body() transferFundsDto: TransferFundsDto): Promise<{ fromTransaction: Transaction; toTransaction: Transaction }> {
        return this.paymentService.transferFunds(transferFundsDto);
    }

    @Put('escrow-accounts/:id/freeze')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Freeze an escrow account' })
    @ApiParam({ name: 'id', description: 'Escrow account ID', type: String })
    @ApiBody({ schema: { properties: { reason: { type: 'string' } } } })
    @ApiResponse({ status: HttpStatus.OK, description: 'Escrow account frozen successfully', type: EscrowAccount })
    async freezeEscrowAccount(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('reason') reason: string,
    ): Promise<EscrowAccount> {
        return this.paymentService.freezeEscrowAccount(id, reason);
    }

    @Put('escrow-accounts/:id/unfreeze')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Unfreeze an escrow account' })
    @ApiParam({ name: 'id', description: 'Escrow account ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Escrow account unfrozen successfully', type: EscrowAccount })
    async unfreezeEscrowAccount(@Param('id', ParseUUIDPipe) id: string): Promise<EscrowAccount> {
        return this.paymentService.unfreezeEscrowAccount(id);
    }

    @Delete('escrow-accounts/:id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Close an escrow account' })
    @ApiParam({ name: 'id', description: 'Escrow account ID', type: String })
    @ApiBody({ schema: { properties: { reason: { type: 'string' } } } })
    @ApiResponse({ status: HttpStatus.OK, description: 'Escrow account closed successfully', type: EscrowAccount })
    async closeEscrowAccount(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('reason') reason: string,
    ): Promise<EscrowAccount> {
        return this.paymentService.closeEscrowAccount(id, reason);
    }

    // ============================================
    // PAYMENT METHOD ENDPOINTS
    // ============================================

    @Post('payment-methods')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new payment method' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Payment method created successfully', type: PaymentMethod })
    async createPaymentMethod(
        @Body() createPaymentMethodDto: CreatePaymentMethodDto,
        @Req() req: any,
    ): Promise<PaymentMethod> {
        // Add user ID from request if not provided
        if (!createPaymentMethodDto.userId && req.user) {
            createPaymentMethodDto.userId = req.user.id;
        }

        return this.paymentService.createPaymentMethod(createPaymentMethodDto);
    }

    @Get('payment-methods/:id')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get a payment method by ID' })
    @ApiParam({ name: 'id', description: 'Payment method ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment method retrieved successfully', type: PaymentMethod })
    async getPaymentMethod(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentMethod> {
        return this.paymentService.getPaymentMethod(id);
    }

    @Get('users/:userId/payment-methods')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get payment methods for a user' })
    @ApiParam({ name: 'userId', description: 'User ID', type: String })
    @ApiQuery({ name: 'includeInactive', type: Boolean, required: false })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment methods retrieved successfully', type: [PaymentMethod] })
    async getUserPaymentMethods(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Query('includeInactive') includeInactive?: boolean,
    ): Promise<PaymentMethod[]> {
        return this.paymentService.getUserPaymentMethods(userId, includeInactive === true);
    }

    @Put('payment-methods/:id/default')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Set a payment method as default' })
    @ApiParam({ name: 'id', description: 'Payment method ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment method set as default successfully' })
    async setDefaultPaymentMethod(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: any,
    ): Promise<void> {
        const userId = req.user.id;
        return this.paymentService.setDefaultPaymentMethod(userId, id);
    }

    @Put('payment-methods/:id/verify')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Verify a payment method' })
    @ApiParam({ name: 'id', description: 'Payment method ID', type: String })
    @ApiBody({ schema: { properties: { verificationMethod: { type: 'string' } } } })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment method verified successfully', type: PaymentMethod })
    async verifyPaymentMethod(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('verificationMethod') verificationMethod: string,
    ): Promise<PaymentMethod> {
        return this.paymentService.verifyPaymentMethod(id, verificationMethod);
    }

    @Delete('payment-methods/:id')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Deactivate a payment method' })
    @ApiParam({ name: 'id', description: 'Payment method ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment method deactivated successfully', type: PaymentMethod })
    async deactivatePaymentMethod(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('reason') reason?: string,
    ): Promise<PaymentMethod> {
        return this.paymentService.deactivatePaymentMethod(id, reason);
    }

    // ============================================
    // PAYOUT REQUEST ENDPOINTS
    // ============================================

    @Post('payout-requests')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new payout request' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Payout request created successfully', type: PayoutRequest })
    async createPayoutRequest(
        @Body() createPayoutRequestDto: CreatePayoutRequestDto,
        @Req() req: any,
    ): Promise<PayoutRequest> {
        // Add user ID from request if not provided
        if (!createPayoutRequestDto.userId && req.user) {
            createPayoutRequestDto.userId = req.user.id;
        }

        return this.paymentService.createPayoutRequest(createPayoutRequestDto);
    }

    @Get('payout-requests/:id')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get a payout request by ID' })
    @ApiParam({ name: 'id', description: 'Payout request ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payout request retrieved successfully', type: PayoutRequest })
    async getPayoutRequest(@Param('id', ParseUUIDPipe) id: string): Promise<PayoutRequest> {
        return this.paymentService.getPayoutRequest(id);
    }

    @Get('users/:userId/payout-requests')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get payout requests for a user' })
    @ApiParam({ name: 'userId', description: 'User ID', type: String })
    @ApiQuery({ name: 'status', enum: PayoutRequestStatus, required: false })
    @ApiQuery({ name: 'type', type: String, required: false })
    @ApiQuery({ name: 'startDate', type: Date, required: false })
    @ApiQuery({ name: 'endDate', type: Date, required: false })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payout requests retrieved successfully', type: [PayoutRequest] })
    async getUserPayoutRequests(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Query('status') status?: PayoutRequestStatus,
        @Query('type') type?: string,
        @Query('startDate') startDate?: Date,
        @Query('endDate') endDate?: Date,
    ): Promise<PayoutRequest[]> {
        return this.paymentService.getUserPayoutRequests(userId, {
            status,
            type: type as any,
            startDate,
            endDate,
        });
    }

    @Put('payout-requests/:id/approve')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Approve a payout request' })
    @ApiParam({ name: 'id', description: 'Payout request ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payout request approved successfully', type: PayoutRequest })
    async approvePayoutRequest(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() approvePayoutDto: ApprovePayoutDto,
    ): Promise<PayoutRequest> {
        return this.paymentService.approvePayoutRequest(id, approvePayoutDto);
    }

    @Put('payout-requests/:id/reject')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Reject a payout request' })
    @ApiParam({ name: 'id', description: 'Payout request ID', type: String })
    @ApiBody({ schema: { properties: { rejectedBy: { type: 'string' }, reason: { type: 'string' } } } })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payout request rejected successfully', type: PayoutRequest })
    async rejectPayoutRequest(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('rejectedBy') rejectedBy: string,
        @Body('reason') reason: string,
    ): Promise<PayoutRequest> {
        return this.paymentService.rejectPayoutRequest(id, rejectedBy, reason);
    }

    @Put('payout-requests/:id/process')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Process a payout request' })
    @ApiParam({ name: 'id', description: 'Payout request ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payout request processed successfully' })
    async processPayoutRequest(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<{ payoutRequest: PayoutRequest; transaction?: Transaction }> {
        return this.paymentService.processPayoutRequest(id);
    }

    // ============================================
    // DISBURSEMENT ENDPOINTS
    // ============================================

    @Post('disbursements')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Create a new disbursement' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Disbursement created successfully', type: Disbursement })
    async createDisbursement(@Body() createDisbursementDto: CreateDisbursementDto): Promise<Disbursement> {
        return this.paymentService.createDisbursement(createDisbursementDto);
    }

    @Get('disbursements/:id')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get a disbursement by ID' })
    @ApiParam({ name: 'id', description: 'Disbursement ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Disbursement retrieved successfully', type: Disbursement })
    async getDisbursement(@Param('id', ParseUUIDPipe) id: string): Promise<Disbursement> {
        return this.paymentService.getDisbursement(id);
    }

    @Get('loans/:loanId/disbursements')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get disbursements for a loan' })
    @ApiParam({ name: 'loanId', description: 'Loan ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Disbursements retrieved successfully', type: [Disbursement] })
    async getLoanDisbursements(@Param('loanId', ParseUUIDPipe) loanId: string): Promise<Disbursement[]> {
        return this.paymentService.getLoanDisbursements(loanId);
    }

    @Put('disbursements/:id/schedule')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Schedule a disbursement' })
    @ApiParam({ name: 'id', description: 'Disbursement ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Disbursement scheduled successfully', type: Disbursement })
    async scheduleDisbursement(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() scheduleDisbursementDto: ScheduleDisbursementDto,
    ): Promise<Disbursement> {
        return this.paymentService.scheduleDisbursement(id, scheduleDisbursementDto);
    }

    @Put('disbursements/:id/approve')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Approve a disbursement' })
    @ApiParam({ name: 'id', description: 'Disbursement ID', type: String })
    @ApiBody({
        schema: {
            properties: {
                approvedBy: { type: 'string' },
                notes: { type: 'string' }
            },
            required: ['approvedBy']
        }
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Disbursement approved successfully', type: Disbursement })
    async approveDisbursement(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('approvedBy') approvedBy: string,
        @Body('notes') notes?: string,
    ): Promise<Disbursement> {
        return this.paymentService.approveDisbursement(id, approvedBy, notes);
    }

    @Put('disbursements/:id/process')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Process a disbursement' })
    @ApiParam({ name: 'id', description: 'Disbursement ID', type: String })
    @ApiBody({
        schema: {
            properties: {
                amount: { type: 'number' }
            },
            required: []
        }
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Disbursement processed successfully' })
    async processDisbursement(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('amount') amount?: number,
    ): Promise<{ disbursement: Disbursement; transaction?: Transaction }> {
        return this.paymentService.processDisbursement(id, amount);
    }

    @Post('disbursements/:id/schedule-installments')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Create a disbursement schedule with installments' })
    @ApiParam({ name: 'id', description: 'Disbursement ID', type: String })
    @ApiBody({
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    amount: { type: 'number' },
                    dueDate: { type: 'string', format: 'date-time' },
                },
            },
        },
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Disbursement schedule created successfully', type: Disbursement })
    async createDisbursementSchedule(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() installments: Array<{ amount: number; dueDate: Date }>,
    ): Promise<Disbursement> {
        return this.paymentService.createDisbursementSchedule(id, installments);
    }

    // ============================================
    // BATCH PROCESSING ENDPOINTS
    // ============================================

    @Post('batch/process-scheduled-disbursements')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Process scheduled disbursements' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Scheduled disbursements processed' })
    async processScheduledDisbursements(): Promise<{ processed: number; failed: number }> {
        return this.paymentService.processScheduledDisbursements();
    }

    @Post('batch/process-pending-payouts')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Process pending payout requests' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Pending payout requests processed' })
    async processPendingPayouts(): Promise<{ processed: number; failed: number }> {
        return this.paymentService.processPendingPayoutRequests();
    }

    // ============================================
    // REPORTING ENDPOINTS
    // ============================================

    @Get('users/:userId/payment-summary')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get payment summary for a user' })
    @ApiParam({ name: 'userId', description: 'User ID', type: String })
    @ApiQuery({ name: 'startDate', type: Date, required: false })
    @ApiQuery({ name: 'endDate', type: Date, required: false })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment summary retrieved successfully' })
    async getPaymentSummary(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Query('startDate') startDate?: Date,
        @Query('endDate') endDate?: Date,
    ): Promise<any> {
        return this.paymentService.getPaymentSummary(userId, startDate, endDate);
    }

    @Get('escrow-balance-summary')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Get escrow balance summary' })
    @ApiQuery({ name: 'loanId', type: String, required: false })
    @ApiResponse({ status: HttpStatus.OK, description: 'Escrow balance summary retrieved successfully' })
    async getEscrowBalanceSummary(@Query('loanId') loanId?: string): Promise<any> {
        return this.paymentService.getEscrowBalanceSummary(loanId);
    }

    @Get('payout-statistics')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Get payout statistics' })
    @ApiQuery({ name: 'timeframe', enum: ['day', 'week', 'month', 'year'], required: false })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payout statistics retrieved successfully' })
    async getPayoutStatistics(@Query('timeframe') timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
        return this.paymentService.getPayoutStatistics(timeframe);
    }

    // ============================================
    // UTILITY ENDPOINTS
    // ============================================

    @Get('health')
    @ApiOperation({ summary: 'Check payment system health' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Health check completed' })
    async healthCheck(): Promise<{ status: string; details: any }> {
        return this.paymentService.healthCheck();
    }

    @Get('available-balance/:escrowAccountId')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get available balance for an escrow account' })
    @ApiParam({ name: 'escrowAccountId', description: 'Escrow account ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Available balance retrieved successfully' })
    async getAvailableBalance(@Param('escrowAccountId', ParseUUIDPipe) escrowAccountId: string): Promise<number> {
        return this.paymentService.getAvailableBalance(escrowAccountId);
    }

    @Post('calculate-fees')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Calculate fees for a transaction' })
    @ApiBody({ schema: { properties: { amount: { type: 'number' }, transactionType: { type: 'string' } } } })
    @ApiResponse({ status: HttpStatus.OK, description: 'Fees calculated successfully' })
    async calculateFees(
        @Body('amount') amount: number,
        @Body('transactionType') transactionType: string,
    ): Promise<{ processingFee: number; tax: number; totalFees: number }> {
        return this.paymentService.calculateFees(amount, transactionType);
    }

    // ============================================
    // PAYMENT PROCESSOR WEBHOOK
    // ============================================

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Handle payment processor webhooks' })
    @ApiHeader({ name: 'stripe-signature', required: false })
    @ApiResponse({ status: HttpStatus.OK, description: 'Webhook processed successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid webhook signature' })
    async handleWebhook(
        @Body() rawBody: any,
        @Headers('stripe-signature') signature: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        try {
            // Get raw body for signature verification
            const rawPayload = JSON.stringify(rawBody);

            // Parse and verify webhook event
            const event = await this.paymentProcessorService.parseWebhookEvent(rawPayload, signature);

            // Process the webhook event
            await this.paymentProcessorService.handleWebhookEvent(event);

            res.status(HttpStatus.OK).send({ received: true });
        } catch (error) {
            this.paymentProcessorService.logger.error(`Webhook processing failed: ${error.message}`);
            res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
        }
    }

    // ============================================
    // PAYMENT PROCESSOR INTEGRATION ENDPOINTS
    // ============================================

    @Post('payment-processor/tokenize')
    @Roles(UserRole.BORROWER, UserRole.LENDER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Tokenize a payment method' })
    @ApiBody({
        schema: {
            properties: {
                cardNumber: { type: 'string' },
                expiryMonth: { type: 'number' },
                expiryYear: { type: 'number' },
                cvv: { type: 'string' },
                holderName: { type: 'string' },
            },
        },
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment method tokenized successfully' })
    async tokenizePaymentMethod(
        @Body('cardNumber') cardNumber: string,
        @Body('expiryMonth') expiryMonth: number,
        @Body('expiryYear') expiryYear: number,
        @Body('cvv') cvv: string,
        @Body('holderName') holderName: string,
    ): Promise<any> {
        return this.paymentProcessorService.tokenizePaymentMethod({
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
            holderName,
        });
    }

    @Post('payment-processor/create-customer')
    @Roles(UserRole.ADMIN, UserRole.LENDER)
    @ApiOperation({ summary: 'Create a customer in payment processor' })
    @ApiBody({
        schema: {
            properties: {
                email: { type: 'string' },
                name: { type: 'string' },
                phone: { type: 'string' }
            },
            required: ['email']
        }
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Customer created successfully' })
    async createCustomer(
        @Body('email') email: string,
        @Body('name') name?: string,
        @Body('phone') phone?: string,
    ): Promise<string> {
        return this.paymentProcessorService.createCustomer(email, name, phone);
    }

    // ============================================
    // SIMULATION ENDPOINTS (For testing/demo)
    // ============================================

    @Post('simulate/payment')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Simulate a payment (for testing)' })
    @ApiBody({
        schema: {
            properties: {
                amount: { type: 'number' },
                success: { type: 'boolean', default: true },
            },
        },
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payment simulation completed' })
    async simulatePayment(
        @Body('amount') amount: number,
        @Body('success') success: boolean = true,
    ): Promise<any> {
        return this.paymentProcessorService.simulatePayment(amount, success);
    }

    @Post('simulate/payout')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Simulate a payout (for testing)' })
    @ApiBody({
        schema: {
            properties: {
                amount: { type: 'number' },
                success: { type: 'boolean', default: true },
            },
        },
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Payout simulation completed' })
    async simulatePayout(
        @Body('amount') amount: number,
        @Body('success') success: boolean = true,
    ): Promise<any> {
        return this.paymentProcessorService.simulatePayout(amount, success);
    }
}