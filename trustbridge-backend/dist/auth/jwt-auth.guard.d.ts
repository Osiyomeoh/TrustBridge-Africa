import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
export declare class JwtAuthGuard implements CanActivate {
    private jwtService;
    private configService;
    private authService;
    constructor(jwtService: JwtService, configService: ConfigService, authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
export declare class RolesGuard implements CanActivate {
    private authService;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getRequiredRole;
}
export declare class PermissionsGuard implements CanActivate {
    private authService;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getRequiredPermission;
}
