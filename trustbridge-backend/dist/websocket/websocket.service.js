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
var WebSocketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
let WebSocketService = WebSocketService_1 = class WebSocketService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(WebSocketService_1.name);
        this.rooms = new Map();
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.eventEmitter.on('verification.submitted', (data) => {
            this.broadcastToRoom('verification', {
                type: 'verification.submitted',
                data,
                timestamp: new Date(),
            });
        });
        this.eventEmitter.on('verification.assigned', (data) => {
            this.broadcastToRoom('verification', {
                type: 'verification.assigned',
                data,
                timestamp: new Date(),
            });
        });
        this.eventEmitter.on('verification.completed', (data) => {
            this.broadcastToRoom('verification', {
                type: 'verification.completed',
                data,
                timestamp: new Date(),
            });
        });
        this.eventEmitter.on('investment.created', (data) => {
            this.broadcastToRoom('investments', {
                type: 'investment.created',
                data,
                timestamp: new Date(),
            });
        });
        this.eventEmitter.on('investment.matured', (data) => {
            this.broadcastToRoom('investments', {
                type: 'investment.matured',
                data,
                timestamp: new Date(),
            });
        });
        this.eventEmitter.on('asset.created', (data) => {
            this.broadcastToRoom('assets', {
                type: 'asset.created',
                data,
                timestamp: new Date(),
            });
        });
        this.eventEmitter.on('asset.verified', (data) => {
            this.broadcastToRoom('assets', {
                type: 'asset.verified',
                data,
                timestamp: new Date(),
            });
        });
        this.eventEmitter.on('system.alert', (data) => {
            this.broadcastToAll({
                type: 'system.alert',
                data,
                timestamp: new Date(),
            });
        });
        this.eventEmitter.on('blockchain.transaction', (data) => {
            this.broadcastToRoom('blockchain', {
                type: 'blockchain.transaction',
                data,
                timestamp: new Date(),
            });
        });
    }
    async broadcastToAll(message) {
        try {
            this.eventEmitter.emit('websocket.broadcastToAll', { message });
            this.logger.log(`Broadcasted message to all clients: ${message.type}`);
        }
        catch (error) {
            this.logger.error('Failed to broadcast to all clients:', error);
        }
    }
    async broadcastToRoom(roomId, message) {
        try {
            this.eventEmitter.emit('websocket.broadcastToRoom', { roomId, message });
            this.logger.log(`Broadcasted message to room ${roomId}: ${message.type}`);
        }
        catch (error) {
            this.logger.error(`Failed to broadcast to room ${roomId}:`, error);
        }
    }
    async sendToUser(userId, message) {
        try {
            this.eventEmitter.emit('websocket.sendToUser', { userId, message });
            this.logger.log(`Sent message to user ${userId}: ${message.type}`);
        }
        catch (error) {
            this.logger.error(`Failed to send message to user ${userId}:`, error);
        }
    }
    async joinRoom(userId, roomId) {
        try {
            this.eventEmitter.emit('websocket.joinRoom', { userId, roomId });
            if (!this.rooms.has(roomId)) {
                this.rooms.set(roomId, {
                    id: roomId,
                    name: this.getRoomDisplayName(roomId),
                    users: new Set(),
                    createdAt: new Date(),
                });
            }
            const room = this.rooms.get(roomId);
            room.users.add(userId);
            this.broadcastToRoom(roomId, {
                type: 'user.joined',
                data: { userId, roomId },
                timestamp: new Date(),
            });
            this.logger.log(`User ${userId} joined room ${roomId}`);
        }
        catch (error) {
            this.logger.error(`Failed to join room ${roomId} for user ${userId}:`, error);
        }
    }
    async leaveRoom(userId, roomId) {
        try {
            this.eventEmitter.emit('websocket.leaveRoom', { userId, roomId });
            const room = this.rooms.get(roomId);
            if (room) {
                room.users.delete(userId);
                if (room.users.size === 0) {
                    this.rooms.delete(roomId);
                }
                else {
                    this.broadcastToRoom(roomId, {
                        type: 'user.left',
                        data: { userId, roomId },
                        timestamp: new Date(),
                    });
                }
            }
            this.logger.log(`User ${userId} left room ${roomId}`);
        }
        catch (error) {
            this.logger.error(`Failed to leave room ${roomId} for user ${userId}:`, error);
        }
    }
    async getConnectedUsers() {
        return Array.from(this.rooms.values()).flatMap(room => Array.from(room.users));
    }
    async getRoomUsers(roomId) {
        const room = this.rooms.get(roomId);
        return room ? Array.from(room.users) : [];
    }
    async getRooms() {
        return Array.from(this.rooms.values());
    }
    async getRoomStats() {
        const rooms = Array.from(this.rooms.values());
        const totalUsers = new Set(rooms.flatMap(room => Array.from(room.users))).size;
        return {
            totalRooms: rooms.length,
            totalUsers,
            roomDetails: rooms.map(room => ({
                id: room.id,
                name: room.name,
                userCount: room.users.size,
                createdAt: room.createdAt,
            })),
        };
    }
    async broadcastVerificationUpdate(assetId, status, score) {
        await this.broadcastToRoom('verification', {
            type: 'verification.update',
            data: { assetId, status, score },
            timestamp: new Date(),
        });
    }
    async broadcastInvestmentUpdate(investmentId, status, returns) {
        await this.broadcastToRoom('investments', {
            type: 'investment.update',
            data: { investmentId, status, returns },
            timestamp: new Date(),
        });
    }
    async broadcastAssetUpdate(assetId, status, verificationScore) {
        await this.broadcastToRoom('assets', {
            type: 'asset.update',
            data: { assetId, status, verificationScore },
            timestamp: new Date(),
        });
    }
    async broadcastMarketUpdate(assetType, price, change) {
        await this.broadcastToRoom('market', {
            type: 'market.update',
            data: { assetType, price, change },
            timestamp: new Date(),
        });
    }
    async broadcastBlockchainUpdate(transactionId, status, gasUsed) {
        await this.broadcastToRoom('blockchain', {
            type: 'blockchain.update',
            data: { transactionId, status, gasUsed },
            timestamp: new Date(),
        });
    }
    async broadcastSystemAlert(alertType, message, severity) {
        await this.broadcastToAll({
            type: 'system.alert',
            data: { alertType, message, severity },
            timestamp: new Date(),
        });
    }
    async notifyUserAssetUpdate(userId, assetId, status) {
        await this.sendToUser(userId, {
            type: 'user.asset.update',
            data: { assetId, status },
            timestamp: new Date(),
            userId,
        });
    }
    async notifyUserInvestmentUpdate(userId, investmentId, status, returns) {
        await this.sendToUser(userId, {
            type: 'user.investment.update',
            data: { investmentId, status, returns },
            timestamp: new Date(),
            userId,
        });
    }
    async notifyUserVerificationUpdate(userId, assetId, status, score) {
        await this.sendToUser(userId, {
            type: 'user.verification.update',
            data: { assetId, status, score },
            timestamp: new Date(),
            userId,
        });
    }
    getRoomDisplayName(roomId) {
        const roomNames = {
            'verification': 'Verification Updates',
            'investments': 'Investment Updates',
            'assets': 'Asset Updates',
            'market': 'Market Updates',
            'blockchain': 'Blockchain Updates',
            'admin': 'Admin Panel',
            'attestors': 'Attestor Updates',
        };
        return roomNames[roomId] || `Room ${roomId}`;
    }
    async getHealthStatus() {
        const connectedUsers = await this.getConnectedUsers();
        const rooms = await this.getRooms();
        return {
            connected: true,
            connectedUsers: connectedUsers.length,
            activeRooms: rooms.length,
            uptime: process.uptime(),
        };
    }
};
exports.WebSocketService = WebSocketService;
exports.WebSocketService = WebSocketService = WebSocketService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], WebSocketService);
//# sourceMappingURL=websocket.service.js.map