import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
export declare class AdminGuard extends JwtAuthGuard implements CanActivate {
    private adminService;
    constructor(adminService: AdminService, jwtService: JwtService, configService: ConfigService, authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
