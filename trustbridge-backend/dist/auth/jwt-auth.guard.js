"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = exports.RolesGuard = exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(jwtService, configService, authService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        try {
            const payload = await this.authService.verifyToken(token);
            const user = await this.authService.getUserFromToken(token);
            request.user = {
                ...payload,
                user,
            };
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        auth_service_1.AuthService])
], JwtAuthGuard);
let RolesGuard = class RolesGuard {
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        const requiredRole = this.getRequiredRole(context);
        if (!requiredRole) {
            return true;
        }
        const hasRole = await this.authService.hasRole(user.sub, requiredRole);
        if (!hasRole) {
            throw new common_1.UnauthorizedException('Insufficient permissions');
        }
        return true;
    }
    getRequiredRole(context) {
        return undefined;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], RolesGuard);
let PermissionsGuard = class PermissionsGuard {
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        const requiredPermission = this.getRequiredPermission(context);
        if (!requiredPermission) {
            return true;
        }
        const hasPermission = await this.authService.hasPermission(user.sub, requiredPermission);
        if (!hasPermission) {
            throw new common_1.UnauthorizedException('Insufficient permissions');
        }
        return true;
    }
    getRequiredPermission(context) {
        return undefined;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], PermissionsGuard);
//# sourceMappingURL=jwt-auth.guard.js.map