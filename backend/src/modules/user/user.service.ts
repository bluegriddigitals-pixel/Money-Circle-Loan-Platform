import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { KycStatus } from '../compliance/entities/kyc.entity';
import { AccountStatus, VerificationStatus } from './entities/user.entity'; // Add these imports

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name); // Add logger

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, // Note: this is usersRepository, not userRepository
    @InjectRepository(UserProfile)
    private profilesRepository: Repository<UserProfile>,
  ) { }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findById(id);
  }

  /**
   * Update user KYC status
   */
  async updateKycStatus(userId: string, kycStatus: KycStatus): Promise<User> {
    const user = await this.findById(userId);
    user.kycStatus = kycStatus;
    return this.usersRepository.save(user);
  }

  /**
   * Initialize user account after email verification
   */
  async initializeUserAccount(userId: string): Promise<void> {
    try {
      // Fix: Use usersRepository instead of userRepository
      const user = await this.usersRepository.findOne({ 
        where: { id: userId } 
      });
      
      if (user) {
        // Update account status
        user.accountStatus = AccountStatus.ACTIVE;
        user.verificationStatus = VerificationStatus.EMAIL_VERIFIED;
        user.kycStatus = KycStatus.NOT_STARTED;
        
        await this.usersRepository.save(user);
        
        // Log the initialization
        this.logger.log(`User account initialized: ${userId}`);
        
        // Create default profile if it doesn't exist
        if (!user.profile) {
          const profile = this.profilesRepository.create({
            user: user,
            notificationPreferences: {
              email: true,
              sms: false,
              push: false,
              marketing: false,
            },
            privacySettings: {
              profileVisibility: 'PRIVATE',
              activityVisibility: 'FRIENDS_ONLY',
              searchVisibility: true,
            },
            securitySettings: {
              twoFactorEnabled: false,
              biometricEnabled: false,
              sessionTimeout: 30,
              loginAlerts: true,
              unusualActivityAlerts: true,
            },
          });
          await this.profilesRepository.save(profile);
          this.logger.log(`Default profile created for user: ${userId}`);
        }
      } else {
        this.logger.warn(`User not found for account initialization: ${userId}`);
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize user account ${userId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to initialize user account');
    }
  }

  async getDashboard(userId: string): Promise<any> {
    const user = await this.findById(userId);

    const dashboardData = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accountStatus: user.accountStatus,
        kycStatus: user.kycStatus,
      },
      profile: user.profile,
    };

    return dashboardData;
  }
}