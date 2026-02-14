import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: Partial<import("../user/entities/user.entity").User>;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: Partial<import("../user/entities/user.entity").User>;
        token: string;
    }>;
    refresh(): Promise<{
        message: string;
        accessToken: string;
    }>;
    getProfile(req: any): Promise<any>;
}
