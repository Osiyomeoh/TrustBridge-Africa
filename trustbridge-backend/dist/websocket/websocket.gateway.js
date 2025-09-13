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
var TrustBridgeWebSocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustBridgeWebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const event_emitter_1 = require("@nestjs/event-emitter");
let TrustBridgeWebSocketGateway = TrustBridgeWebSocketGateway_1 = class TrustBridgeWebSocketGateway {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(TrustBridgeWebSocketGateway_1.name);
        this.connectedUsers = new Map();
        this.userRooms = new Map();
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.eventEmitter.on('websocket.broadcastToRoom', ({ roomId, message }) => {
            this.broadcastToRoom(roomId, message);
        });
        this.eventEmitter.on('websocket.sendToUser', ({ userId, message }) => {
            this.sendToUser(userId, message);
        });
        this.eventEmitter.on('websocket.broadcastToAll', ({ message }) => {
            this.broadcastToAll(message);
        });
        this.eventEmitter.on('websocket.joinRoom', ({ userId, roomId }) => {
            this.joinRoom(userId, roomId);
        });
        this.eventEmitter.on('websocket.leaveRoom', ({ userId, roomId }) => {
            this.leaveRoom(userId, roomId);
        });
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        client.emit('connected', {
            type: 'connection.established',
            data: { clientId: client.id, timestamp: new Date() },
            timestamp: new Date(),
        });
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        for (const [userId, socket] of this.connectedUsers.entries()) {
            if (socket.id === client.id) {
                this.connectedUsers.delete(userId);
                const userRooms = this.userRooms.get(userId);
                if (userRooms) {
                    for (const roomId of userRooms) {
                        this.leaveRoom(userId, roomId);
                    }
                    this.userRooms.delete(userId);
                }
                break;
            }
        }
    }
    handleAuthenticate(data, client) {
        try {
            const { userId } = data;
            this.connectedUsers.set(userId, client);
            this.userRooms.set(userId, new Set());
            client.emit('authenticated', {
                type: 'authentication.success',
                data: { userId, timestamp: new Date() },
                timestamp: new Date(),
            });
            this.logger.log(`User authenticated: ${userId}`);
        }
        catch (error) {
            this.logger.error('Authentication failed:', error);
            client.emit('error', {
                type: 'authentication.failed',
                data: { error: error.message },
                timestamp: new Date(),
            });
        }
    }
    handleJoinRoom(data, client) {
        try {
            const userId = this.getUserIdFromClient(client);
            if (!userId) {
                client.emit('error', {
                    type: 'authentication.required',
                    data: { message: 'User must be authenticated to join rooms' },
                    timestamp: new Date(),
                });
                return;
            }
            const { roomId } = data;
            this.joinRoom(userId, roomId);
            client.emit('room_joined', {
                type: 'room.joined',
                data: { roomId, userId },
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to join room:', error);
            client.emit('error', {
                type: 'room.join.failed',
                data: { error: error.message },
                timestamp: new Date(),
            });
        }
    }
    handleLeaveRoom(data, client) {
        try {
            const userId = this.getUserIdFromClient(client);
            if (!userId) {
                client.emit('error', {
                    type: 'authentication.required',
                    data: { message: 'User must be authenticated to leave rooms' },
                    timestamp: new Date(),
                });
                return;
            }
            const { roomId } = data;
            this.leaveRoom(userId, roomId);
            client.emit('room_left', {
                type: 'room.left',
                data: { roomId, userId },
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to leave room:', error);
            client.emit('error', {
                type: 'room.leave.failed',
                data: { error: error.message },
                timestamp: new Date(),
            });
        }
    }
    handleSubscribeAsset(data, client) {
        try {
            const userId = this.getUserIdFromClient(client);
            if (!userId) {
                client.emit('error', {
                    type: 'authentication.required',
                    data: { message: 'User must be authenticated to subscribe to assets' },
                    timestamp: new Date(),
                });
                return;
            }
            const { assetId } = data;
            const roomId = `asset_${assetId}`;
            this.joinRoom(userId, roomId);
            client.emit('asset_subscribed', {
                type: 'asset.subscribed',
                data: { assetId, userId },
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to subscribe to asset:', error);
            client.emit('error', {
                type: 'asset.subscribe.failed',
                data: { error: error.message },
                timestamp: new Date(),
            });
        }
    }
    handleSubscribeInvestment(data, client) {
        try {
            const userId = this.getUserIdFromClient(client);
            if (!userId) {
                client.emit('error', {
                    type: 'authentication.required',
                    data: { message: 'User must be authenticated to subscribe to investments' },
                    timestamp: new Date(),
                });
                return;
            }
            const { investmentId } = data;
            const roomId = `investment_${investmentId}`;
            this.joinRoom(userId, roomId);
            client.emit('investment_subscribed', {
                type: 'investment.subscribed',
                data: { investmentId, userId },
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to subscribe to investment:', error);
            client.emit('error', {
                type: 'investment.subscribe.failed',
                data: { error: error.message },
                timestamp: new Date(),
            });
        }
    }
    handleGetRooms(client) {
        try {
            const rooms = Array.from(this.userRooms.values())
                .flatMap(roomSet => Array.from(roomSet))
                .filter((roomId, index, array) => array.indexOf(roomId) === index);
            client.emit('rooms_list', {
                type: 'rooms.list',
                data: { rooms },
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to get rooms:', error);
            client.emit('error', {
                type: 'rooms.get.failed',
                data: { error: error.message },
                timestamp: new Date(),
            });
        }
    }
    handlePing(client) {
        client.emit('pong', {
            type: 'pong',
            data: { timestamp: new Date() },
            timestamp: new Date(),
        });
    }
    broadcastToAll(message) {
        this.server.emit('broadcast', message);
    }
    broadcastToRoom(roomId, message) {
        this.server.to(roomId).emit('room_broadcast', message);
    }
    sendToUser(userId, message) {
        const client = this.connectedUsers.get(userId);
        if (client) {
            client.emit('user_message', message);
        }
    }
    joinRoom(userId, roomId) {
        const client = this.connectedUsers.get(userId);
        if (client) {
            client.join(roomId);
            const userRooms = this.userRooms.get(userId);
            if (userRooms) {
                userRooms.add(roomId);
            }
        }
    }
    leaveRoom(userId, roomId) {
        const client = this.connectedUsers.get(userId);
        if (client) {
            client.leave(roomId);
            const userRooms = this.userRooms.get(userId);
            if (userRooms) {
                userRooms.delete(roomId);
            }
        }
    }
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
    getUserIdFromClient(client) {
        for (const [userId, socket] of this.connectedUsers.entries()) {
            if (socket.id === client.id) {
                return userId;
            }
        }
        return null;
    }
    getHealthStatus() {
        const activeRooms = new Set();
        for (const roomSet of this.userRooms.values()) {
            for (const roomId of roomSet) {
                activeRooms.add(roomId);
            }
        }
        return {
            connected: true,
            connectedUsers: this.connectedUsers.size,
            activeRooms: activeRooms.size,
        };
    }
};
exports.TrustBridgeWebSocketGateway = TrustBridgeWebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TrustBridgeWebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('authenticate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrustBridgeWebSocketGateway.prototype, "handleAuthenticate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrustBridgeWebSocketGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrustBridgeWebSocketGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_asset'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrustBridgeWebSocketGateway.prototype, "handleSubscribeAsset", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_investment'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrustBridgeWebSocketGateway.prototype, "handleSubscribeInvestment", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_rooms'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrustBridgeWebSocketGateway.prototype, "handleGetRooms", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrustBridgeWebSocketGateway.prototype, "handlePing", null);
exports.TrustBridgeWebSocketGateway = TrustBridgeWebSocketGateway = TrustBridgeWebSocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        namespace: '/ws',
    }),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], TrustBridgeWebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map