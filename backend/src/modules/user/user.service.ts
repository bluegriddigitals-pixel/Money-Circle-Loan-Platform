import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profilesRepository: Repository<UserProfile>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile', 'wallet'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['profile', 'wallet'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    
    // Update user fields
    Object.assign(user, updateDto);
    
    // Update profile if provided
    if (updateDto.profile) {
      if (!user.profile) {
        user.profile = this.profilesRepository.create({
          userId: user.id,
          ...updateDto.profile,
        });
      } else {
        Object.assign(user.profile, updateDto.profile);
      }
    }
    
    await this.usersRepository.save(user);
    
    return this.findById(userId);
  }

  async updateKycStatus(userId: string, kycDto: UpdateKycDto): Promise<User> {
    const user = await this.findById(userId);
    
    // Only auditors and admins can update KYC status
    // This check should be done at controller level using guards
    
    Object.assign(user, kycDto);
    
    await this.usersRepository.save(user);
    
    return this.findById(userId);
  }

  async getDashboard(userId: string): Promise<any> {
    const user = await this.findById(userId);
    
    let dashboardData: any = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        kycStatus: user.kycStatus,
      },
      profile: user.profile,
      wallet: user.wallet,
    };
    
    // Add role-specific data
    if (user.role === UserRole.BORROWER) {
      dashboardData.loans = {
        active: 0,
        pending: 0,
        totalBorrowed: user.profile.totalBorrowed,
        outstandingBalance: user.profile.outstandingBalance,
      };
    } else if (user.role === UserRole.LENDER) {
      dashboardData.investments = {
        active: 0,
        totalInvested: user.profile.totalInvested,
        totalEarned: user.profile.totalEarned,
        expectedReturns: 0,
      };
    }
    
    return dashboardData;
  }

  async getUsers(page = 1, limit = 10, filters: any = {}): Promise<{ users: User[]; total: number }> {
    const query = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('1 = 1');
    
    // Apply filters
    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }
    
    if (filters.status) {
      query.andWhere('user.status = :status', { status: filters.status });
    }
    
    if (filters.kycStatus) {
      query.andWhere('user.kycStatus = :kycStatus', { kycStatus: filters.kycStatus });
    }
    
    if (filters.search) {
      query.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    
    // Get total count
    const total = await query.getCount();
    
    // Apply pagination
    const users = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getMany();
    
    return { users, total };
  }

  async updateUserStatus(
    userId: string,
    status: string,
    reason?: string,
  ): Promise<User> {
    const user = await this.findById(userId);
    
    // Validate status
    if (!Object.values(['pending', 'active', 'suspended', 'deactivated']).includes(status)) {
      throw new BadRequestException('Invalid status');
    }
    
    user.status = status as any;
    
    if (status === 'deactivated') {
      user.deactivatedAt = new Date();
    }
    
    await this.usersRepository.save(user);
    
    // Log status change (would be in a separate audit log service)
    
    return this.findById(userId);
  }
}