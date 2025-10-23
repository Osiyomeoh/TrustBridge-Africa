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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AdminController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = exports.RemoveRoleDto = exports.AssignRoleDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const class_validator_1 = require("class-validator");
const user_schema_1 = require("../schemas/user.schema");
class AssignRoleDto {
}
exports.AssignRoleDto = AssignRoleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "targetWallet", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(user_schema_1.UserRole),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "role", void 0);
class RemoveRoleDto {
}
exports.RemoveRoleDto = RemoveRoleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RemoveRoleDto.prototype, "targetWallet", void 0);
let AdminController = AdminController_1 = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
        this.logger = new common_1.Logger(AdminController_1.name);
    }
    async getAdminStatus(req) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        this.logger.log(`Checking admin status for wallet: ${walletAddress}`);
        return this.adminService.checkAdminStatus(walletAddress);
    }
    async getAllAdminUsers(req) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        const hasPermission = await this.adminService.hasPermission(walletAddress, 'manage_users');
        if (!hasPermission) {
            throw new Error('Insufficient permissions to view admin users');
        }
        this.logger.log(`Retrieving admin users for wallet: ${walletAddress}`);
        return this.adminService.getAllAdminUsers();
    }
    async getAdminStats(req) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        const hasPermission = await this.adminService.hasPermission(walletAddress, 'view_analytics');
        if (!hasPermission) {
            throw new Error('Insufficient permissions to view admin statistics');
        }
        this.logger.log(`Retrieving admin stats for wallet: ${walletAddress}`);
        return this.adminService.getAdminStats();
    }
    async assignRole(req, assignRoleDto) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        this.logger.log(`Assigning role ${assignRoleDto.role} to ${assignRoleDto.targetWallet} by ${walletAddress}`);
        return this.adminService.assignAdminRole(walletAddress, assignRoleDto.targetWallet, assignRoleDto.role);
    }
    async removeRole(req, removeRoleDto) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        this.logger.log(`Removing admin role from ${removeRoleDto.targetWallet} by ${walletAddress}`);
        return this.adminService.removeAdminRole(walletAddress, removeRoleDto.targetWallet);
    }
    async checkPermission(req, permission) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        this.logger.log(`Checking permission ${permission} for wallet: ${walletAddress}`);
        const hasPermission = await this.adminService.hasPermission(walletAddress, permission);
        return {
            walletAddress,
            permission,
            hasPermission
        };
    }
    async createHederaAdmin(req, body) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        const hasPermission = await this.adminService.hasPermission(walletAddress, 'assign_roles');
        if (!hasPermission) {
            throw new common_1.UnauthorizedException('Insufficient permissions to create admin accounts');
        }
        this.logger.log(`Creating Hedera admin account: ${body.adminName} with role: ${body.role} by ${walletAddress}`);
        return this.adminService.createHederaAdminAccount(body.adminName, body.role);
    }
    async removeHederaAdmin(req, body) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        const hasPermission = await this.adminService.hasPermission(walletAddress, 'assign_roles');
        if (!hasPermission) {
            throw new common_1.UnauthorizedException('Insufficient permissions to remove admin accounts');
        }
        this.logger.log(`Removing Hedera admin account: ${body.accountId} by ${walletAddress}`);
        return this.adminService.removeHederaAdminAccount(body.accountId);
    }
    async getHederaAdminAccounts(req) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        const hasPermission = await this.adminService.hasPermission(walletAddress, 'view_analytics');
        if (!hasPermission) {
            throw new common_1.UnauthorizedException('Insufficient permissions to view admin accounts');
        }
        this.logger.log(`Retrieving Hedera admin accounts for wallet: ${walletAddress}`);
        return this.adminService.getHederaAdminAccounts();
    }
    async checkHederaAdminStatus(req, accountId) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        this.logger.log(`Checking Hedera admin status for account: ${accountId} by wallet: ${walletAddress}`);
        const isAdmin = await this.adminService.isHederaAdmin(accountId);
        const role = await this.adminService.getHederaAdminRole(accountId);
        return {
            accountId,
            isAdmin,
            role,
            timestamp: new Date().toISOString()
        };
    }
    async setupHederaAdminAccounts(req) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        const hasPermission = await this.adminService.hasPermission(walletAddress, 'assign_roles');
        if (!hasPermission) {
            throw new common_1.UnauthorizedException('Insufficient permissions to setup admin accounts');
        }
        this.logger.log(`Setting up Hedera admin accounts by wallet: ${walletAddress}`);
        return this.adminService.setupHederaAdminAccounts();
    }
    async createInitialHederaSuperAdmin(req) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        this.logger.log(`Creating initial Hedera super admin by wallet: ${walletAddress}`);
        return this.adminService.createInitialHederaSuperAdmin();
    }
    async approveAsset(req, body) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        this.logger.log(`Asset approval request from ${walletAddress} for asset ${body.assetId}`);
        return this.adminService.approveAsset(walletAddress, body.assetId, body.approved, body.comments, body.verificationScore);
    }
    async rejectAsset(req, body) {
        const walletAddress = req.user?.walletAddress;
        if (!walletAddress) {
            throw new Error('Wallet address not found in request');
        }
        this.logger.log(`Asset rejection request from ${walletAddress} for asset ${body.assetId}`);
        return this.adminService.approveAsset(walletAddress, body.assetId, false, body.comments);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check admin status for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin status retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminStatus", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all admin users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin users retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllAdminUsers", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin statistics retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminStats", null);
__decorate([
    (0, common_1.Post)('assign-role'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign admin role to user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid role or user not found' }),
    (0, swagger_1.ApiBody)({ type: AssignRoleDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AssignRoleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)('remove-role'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove admin role from user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - user not found' }),
    (0, swagger_1.ApiBody)({ type: RemoveRoleDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RemoveRoleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeRole", null);
__decorate([
    (0, common_1.Get)('permissions/:permission'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if user has specific permission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permission check result' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "checkPermission", null);
__decorate([
    (0, common_1.Post)('hedera/create-admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Hedera admin account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hedera admin account created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid parameters' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createHederaAdmin", null);
__decorate([
    (0, common_1.Delete)('hedera/remove-admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a Hedera admin account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hedera admin account removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - account not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeHederaAdmin", null);
__decorate([
    (0, common_1.Get)('hedera/admin-accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Hedera admin accounts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hedera admin accounts retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - insufficient permissions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getHederaAdminAccounts", null);
__decorate([
    (0, common_1.Get)('hedera/admin-status/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if account is a Hedera admin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hedera admin status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - insufficient permissions' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "checkHederaAdminStatus", null);
__decorate([
    (0, common_1.Post)('hedera/setup-admin-accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Setup all Hedera admin accounts (for initial setup)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hedera admin accounts setup completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - setup already completed' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setupHederaAdminAccounts", null);
__decorate([
    (0, common_1.Post)('hedera/create-initial-super-admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create the initial Hedera super admin account (for first-time setup)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Initial Hedera super admin created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - super admin already exists' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createInitialHederaSuperAdmin", null);
__decorate([
    (0, common_1.Post)('approve-asset'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve an RWA asset for tokenization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveAsset", null);
__decorate([
    (0, common_1.Post)('reject-asset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject an RWA asset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset rejected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectAsset", null);
exports.AdminController = AdminController = AdminController_1 = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map