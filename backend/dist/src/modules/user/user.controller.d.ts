import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<import("./entities/user.entity").User>;
    getDashboard(req: any): Promise<any>;
}
