import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { NotificationService } from '../notification/notification.service';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private notificationService;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService, notificationService: NotificationService);
    register(registerDto: RegisterDto): Promise<{
        user: Partial<User>;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: Partial<User>;
        token: string;
    }>;
    verifyEmail(userId: string): Promise<{
        message: string;
    }>;
    sendVerificationEmail(userId: string): Promise<{
        message: string;
    }>;
    verifyPhone(userId: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    enableTwoFactor(userId: string, ipAddress: string): Promise<{
        message: string;
    }>;
    disableTwoFactor(userId: string, ipAddress: string): Promise<{
        message: string;
    }>;
    sendSecurityAlertEmail(userId: string, alertType: string, details: any): Promise<{
        message: string;
    }>;
    sendSuspiciousActivityAlert(userId: string, activity: any): Promise<{
        message: string;
    }>;
    private generateToken;
}
