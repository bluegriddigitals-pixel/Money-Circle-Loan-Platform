import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Req() req) {
    return this.userService.findById(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Req() req, @Body() updateDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, updateDto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get user dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDashboard(@Req() req) {
    return this.userService.getDashboard(req.user.id);
  }

  @Put('kyc')
  @ApiOperation({ summary: 'Update KYC status (Admin/Auditor only)' })
  @ApiResponse({ status: 200, description: 'KYC status updated' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.AUDITOR, UserRole.SYSTEM_ADMIN)
  async updateKyc(@Body() kycDto: UpdateKycDto) {
    // In real implementation, you would have user ID in body or params
    return this.userService.updateKycStatus(kycDto.userId, kycDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get users with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'kycStatus', required: false })
  @ApiQuery({ name: 'search', required: false })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  async getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('role') role?: UserRole,
    @Query('status') status?: string,
    @Query('kycStatus') kycStatus?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      role,
      status,
      kycStatus,
      search,
    };
    return this.userService.getUsers(page, limit, filters);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  async updateUserStatus(
    @Param('id') userId: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.userService.updateUserStatus(userId, status, reason);
  }
}