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
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const admin_service_1 = require("../admin/admin.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
let AdminGuard = class AdminGuard extends jwt_auth_guard_1.JwtAuthGuard {
    constructor(adminService, jwtService, configService, authService) {
        super(jwtService, configService, authService);
        this.adminService = adminService;
    }
    async canActivate(context) {
        const isAuthenticated = await super.canActivate(context);
        if (!isAuthenticated) {
            return false;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.walletAddress) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const adminStatus = await this.adminService.checkAdminStatus(user.walletAddress);
        if (!adminStatus.isAdmin) {
            throw new common_1.ForbiddenException('Insufficient admin privileges');
        }
        return true;
    }
};
exports.AdminGuard = AdminGuard;
exports.AdminGuard = AdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        jwt_1.JwtService,
        config_1.ConfigService,
        auth_service_1.AuthService])
], AdminGuard);
//# sourceMappingURL=admin.guard.js.map