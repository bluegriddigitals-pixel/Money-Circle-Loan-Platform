import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
export declare class UserService {
    private usersRepository;
    private profilesRepository;
    constructor(usersRepository: Repository<User>, profilesRepository: Repository<UserProfile>);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User>;
    getDashboard(userId: string): Promise<any>;
}
