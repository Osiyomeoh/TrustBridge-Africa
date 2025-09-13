import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUsers(): Promise<{
        success: boolean;
        data: import("../schemas/user.schema").User[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
