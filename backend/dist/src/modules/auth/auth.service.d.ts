import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersRepository;
    private profilesRepository;
    private jwtService;
    private configService;
    constructor(usersRepository: Repository<User>, profilesRepository: Repository<UserProfile>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        user: User;
        tokens: any;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: User;
        tokens: any;
    }>;
    generateTokens(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    validateUser(userId: string): Promise<User>;
}
