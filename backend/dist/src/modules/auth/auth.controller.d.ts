import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: import("../user/entities/user.entity").User;
        tokens: any;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: import("../user/entities/user.entity").User;
        tokens: any;
    }>;
    refresh(_refreshToken: string): Promise<{
        message: string;
        accessToken: string;
    }>;
    getProfile(req: any): Promise<any>;
}
