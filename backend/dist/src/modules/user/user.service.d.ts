import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { KycStatus } from '../compliance/entities/kyc.entity';
export declare class UserService {
    private usersRepository;
    private profilesRepository;
    private readonly logger;
    constructor(usersRepository: Repository<User>, profilesRepository: Repository<UserProfile>);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User>;
    updateKycStatus(userId: string, kycStatus: KycStatus): Promise<User>;
    initializeUserAccount(userId: string): Promise<void>;
    getDashboard(userId: string): Promise<any>;
}
