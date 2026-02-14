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
    Request,
    HttpStatus,
    HttpCode,
    ParseUUIDPipe,
    Patch,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanResponseDto } from './dto/loan-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { LoanStatus } from './entities/loan.entity'

@ApiTags('loans')
@Controller('loans')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LoanController {
    constructor(private readonly loanService: LoanService) { }

    @Post()
    @Roles(UserRole.BORROWER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new loan application' })
    @ApiResponse({ status: 201, description: 'Loan created successfully', type: LoanResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async create(@Body() createLoanDto: CreateLoanDto, @Request() req): Promise<LoanResponseDto> {
        return this.loanService.create(createLoanDto, req.user.id);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.LENDER)
    @ApiOperation({ summary: 'Get all loans with pagination and filters' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({ name: 'status', required: false, enum: LoanStatus, description: 'Filter by status' })
    @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
    @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum loan amount' })
    @ApiQuery({ name: 'maxAmount', required: false, type: Number, description: 'Maximum loan amount' })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter' })
    @ApiResponse({ status: 200, description: 'Return all loans', type: [LoanResponseDto] })
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: LoanStatus,
        @Query('userId') userId?: string,
        @Query('minAmount') minAmount?: number,
        @Query('maxAmount') maxAmount?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const filters = { status, userId, minAmount, maxAmount, startDate, endDate };
        return this.loanService.findAllWithFilters(filters, page, limit);
    }

    @Get('my-loans')
    @Roles(UserRole.BORROWER)
    @ApiOperation({ summary: 'Get current user loans' })
    @ApiResponse({ status: 200, description: 'Return user loans', type: [LoanResponseDto] })
    async findMyLoans(@Request() req) {
        return this.loanService.findByUser(req.user.id);
    }

    @Get('available')
    @Roles(UserRole.LENDER)
    @ApiOperation({ summary: 'Get available loans for investment' })
    @ApiResponse({ status: 200, description: 'Return available loans', type: [LoanResponseDto] })
    async findAvailableLoans() {
        return this.loanService.findAvailableLoans();
    }

    @Get('stats')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR)
    @ApiOperation({ summary: 'Get loan statistics' })
    @ApiResponse({ status: 200, description: 'Return loan statistics' })
    async getStats() {
        return this.loanService.getLoanStats();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.BORROWER, UserRole.LENDER)
    @ApiOperation({ summary: 'Get loan by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    @ApiResponse({ status: 200, description: 'Return loan', type: LoanResponseDto })
    @ApiResponse({ status: 404, description: 'Loan not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req): Promise<LoanResponseDto> {
        return this.loanService.findOne(id, req.user);
    }

    @Get(':id/repayment-schedule')
    @Roles(UserRole.BORROWER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get loan repayment schedule' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    @ApiResponse({ status: 200, description: 'Return repayment schedule' })
    async getRepaymentSchedule(@Param('id', ParseUUIDPipe) id: string) {
        return this.loanService.calculateRepaymentSchedule(id);
    }

    @Patch(':id')
    @Roles(UserRole.BORROWER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Update loan' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    @ApiResponse({ status: 200, description: 'Loan updated', type: LoanResponseDto })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateLoanDto: UpdateLoanDto,
        @Request() req,
    ): Promise<LoanResponseDto> {
        return this.loanService.update(id, updateLoanDto, req.user);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
    @ApiOperation({ summary: 'Update loan status' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    @ApiResponse({ status: 200, description: 'Loan status updated' })
    async updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: LoanStatus,
        @Body('reason') reason: string,
        @Request() req,
    ) {

        return this.loanService.updateLoanStatus(id, status, reason, req.user.id);
    }

    @Post(':id/approve')
    @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Approve loan' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    async approve(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        return this.loanService.approveLoan(id, req.user.id);
    }

    @Post(':id/reject')
    @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reject loan' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    async reject(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('reason') reason: string,
        @Request() req,
    ) {
        return this.loanService.rejectLoan(id, reason, req.user.id);
    }

    @Post(':id/disburse')
    @Roles(UserRole.ADMIN, UserRole.TRANSACTION_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Disburse loan' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    async disburse(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        return this.loanService.disburseLoan(id, req.user.id);
    }

    @Post(':id/complete')
    @Roles(UserRole.ADMIN, UserRole.BORROWER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark loan as completed' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    async complete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        return this.loanService.completeLoan(id, req.user.id);
    }

    @Post(':id/default')
    @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark loan as defaulted' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    async default(@Param('id', ParseUUIDPipe) id: string, @Body('reason') reason: string, @Request() req) {
        return this.loanService.defaultLoan(id, reason, req.user.id);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete loan' })
    @ApiParam({ name: 'id', type: String, description: 'Loan ID' })
    @ApiResponse({ status: 204, description: 'Loan deleted' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.loanService.remove(id);
    }
}