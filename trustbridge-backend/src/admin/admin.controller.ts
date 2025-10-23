import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Logger, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AdminService, AdminRole, AdminAssignment } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  targetWallet: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class RemoveRoleDto {
  @IsString()
  @IsNotEmpty()
  targetWallet: string;
}

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check admin status for current user' })
  @ApiResponse({ status: 200, description: 'Admin status retrieved successfully' })
  async getAdminStatus(@Request() req): Promise<AdminRole> {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    this.logger.log(`Checking admin status for wallet: ${walletAddress}`);
    return this.adminService.checkAdminStatus(walletAddress);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, description: 'Admin users retrieved successfully' })
  async getAllAdminUsers(@Request() req) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    // Check if user has permission to view admin users
    const hasPermission = await this.adminService.hasPermission(walletAddress, 'manage_users');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to view admin users');
    }

    this.logger.log(`Retrieving admin users for wallet: ${walletAddress}`);
    return this.adminService.getAllAdminUsers();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get admin statistics' })
  @ApiResponse({ status: 200, description: 'Admin statistics retrieved successfully' })
  async getAdminStats(@Request() req) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    // Check if user has permission to view admin stats
    const hasPermission = await this.adminService.hasPermission(walletAddress, 'view_analytics');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to view admin statistics');
    }

    this.logger.log(`Retrieving admin stats for wallet: ${walletAddress}`);
    return this.adminService.getAdminStats();
  }

  @Post('assign-role')
  @ApiOperation({ summary: 'Assign admin role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid role or user not found' })
  @ApiBody({ type: AssignRoleDto })
  async assignRole(@Request() req, @Body() assignRoleDto: AssignRoleDto) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    this.logger.log(`Assigning role ${assignRoleDto.role} to ${assignRoleDto.targetWallet} by ${walletAddress}`);
    return this.adminService.assignAdminRole(
      walletAddress,
      assignRoleDto.targetWallet,
      assignRoleDto.role
    );
  }

  @Delete('remove-role')
  @ApiOperation({ summary: 'Remove admin role from user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Bad request - user not found' })
  @ApiBody({ type: RemoveRoleDto })
  async removeRole(@Request() req, @Body() removeRoleDto: RemoveRoleDto) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    this.logger.log(`Removing admin role from ${removeRoleDto.targetWallet} by ${walletAddress}`);
    return this.adminService.removeAdminRole(
      walletAddress,
      removeRoleDto.targetWallet
    );
  }

  @Get('permissions/:permission')
  @ApiOperation({ summary: 'Check if user has specific permission' })
  @ApiResponse({ status: 200, description: 'Permission check result' })
  async checkPermission(@Request() req, @Param('permission') permission: string) {
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

  // ============================================================================
  // HEDERA NATIVE ADMIN MANAGEMENT ENDPOINTS
  // ============================================================================

  @Post('hedera/create-admin')
  @ApiOperation({ summary: 'Create a new Hedera admin account' })
  @ApiResponse({ status: 200, description: 'Hedera admin account created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  async createHederaAdmin(@Request() req, @Body() body: { adminName: string; role: string }) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    // Check if user has permission to create admin accounts
    const hasPermission = await this.adminService.hasPermission(walletAddress, 'assign_roles');
    if (!hasPermission) {
      throw new UnauthorizedException('Insufficient permissions to create admin accounts');
    }

    this.logger.log(`Creating Hedera admin account: ${body.adminName} with role: ${body.role} by ${walletAddress}`);
    return this.adminService.createHederaAdminAccount(body.adminName, body.role);
  }

  @Delete('hedera/remove-admin')
  @ApiOperation({ summary: 'Remove a Hedera admin account' })
  @ApiResponse({ status: 200, description: 'Hedera admin account removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Bad request - account not found' })
  async removeHederaAdmin(@Request() req, @Body() body: { accountId: string }) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    // Check if user has permission to remove admin accounts
    const hasPermission = await this.adminService.hasPermission(walletAddress, 'assign_roles');
    if (!hasPermission) {
      throw new UnauthorizedException('Insufficient permissions to remove admin accounts');
    }

    this.logger.log(`Removing Hedera admin account: ${body.accountId} by ${walletAddress}`);
    return this.adminService.removeHederaAdminAccount(body.accountId);
  }

  @Get('hedera/admin-accounts')
  @ApiOperation({ summary: 'Get all Hedera admin accounts' })
  @ApiResponse({ status: 200, description: 'Hedera admin accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - insufficient permissions' })
  async getHederaAdminAccounts(@Request() req) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    // Check if user has permission to view admin accounts
    const hasPermission = await this.adminService.hasPermission(walletAddress, 'view_analytics');
    if (!hasPermission) {
      throw new UnauthorizedException('Insufficient permissions to view admin accounts');
    }

    this.logger.log(`Retrieving Hedera admin accounts for wallet: ${walletAddress}`);
    return this.adminService.getHederaAdminAccounts();
  }

  @Get('hedera/admin-status/:accountId')
  @ApiOperation({ summary: 'Check if account is a Hedera admin' })
  @ApiResponse({ status: 200, description: 'Hedera admin status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - insufficient permissions' })
  async checkHederaAdminStatus(@Request() req, @Param('accountId') accountId: string) {
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

  @Post('hedera/setup-admin-accounts')
  @ApiOperation({ summary: 'Setup all Hedera admin accounts (for initial setup)' })
  @ApiResponse({ status: 200, description: 'Hedera admin accounts setup completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Bad request - setup already completed' })
  async setupHederaAdminAccounts(@Request() req) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    // Check if user has permission to setup admin accounts
    const hasPermission = await this.adminService.hasPermission(walletAddress, 'assign_roles');
    if (!hasPermission) {
      throw new UnauthorizedException('Insufficient permissions to setup admin accounts');
    }

    this.logger.log(`Setting up Hedera admin accounts by wallet: ${walletAddress}`);
    return this.adminService.setupHederaAdminAccounts();
  }

  @Post('hedera/create-initial-super-admin')
  @ApiOperation({ summary: 'Create the initial Hedera super admin account (for first-time setup)' })
  @ApiResponse({ status: 200, description: 'Initial Hedera super admin created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - super admin already exists' })
  async createInitialHederaSuperAdmin(@Request() req) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    this.logger.log(`Creating initial Hedera super admin by wallet: ${walletAddress}`);
    return this.adminService.createInitialHederaSuperAdmin();
  }

  // ============================================================================
  // ASSET APPROVAL ENDPOINTS
  // ============================================================================

  @Post('approve-asset')
  @ApiOperation({ summary: 'Approve an RWA asset for tokenization' })
  @ApiResponse({ status: 200, description: 'Asset approved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async approveAsset(@Request() req, @Body() body: { assetId: string; approved: boolean; comments?: string; verificationScore?: number }) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    this.logger.log(`Asset approval request from ${walletAddress} for asset ${body.assetId}`);
    return this.adminService.approveAsset(walletAddress, body.assetId, body.approved, body.comments, body.verificationScore);
  }

  @Post('reject-asset')
  @ApiOperation({ summary: 'Reject an RWA asset' })
  @ApiResponse({ status: 200, description: 'Asset rejected successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async rejectAsset(@Request() req, @Body() body: { assetId: string; approved: boolean; comments?: string }) {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      throw new Error('Wallet address not found in request');
    }

    this.logger.log(`Asset rejection request from ${walletAddress} for asset ${body.assetId}`);
    return this.adminService.approveAsset(walletAddress, body.assetId, false, body.comments);
  }
}