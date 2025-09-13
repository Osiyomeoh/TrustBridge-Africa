import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocketMessage } from './websocket.service';
export declare class TrustBridgeWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private eventEmitter;
    server: Server;
    private readonly logger;
    private readonly connectedUsers;
    private readonly userRooms;
    constructor(eventEmitter: EventEmitter2);
    private setupEventListeners;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleAuthenticate(data: {
        userId: string;
        token?: string;
    }, client: Socket): void;
    handleJoinRoom(data: {
        roomId: string;
    }, client: Socket): void;
    handleLeaveRoom(data: {
        roomId: string;
    }, client: Socket): void;
    handleSubscribeAsset(data: {
        assetId: string;
    }, client: Socket): void;
    handleSubscribeInvestment(data: {
        investmentId: string;
    }, client: Socket): void;
    handleGetRooms(client: Socket): void;
    handlePing(client: Socket): void;
    broadcastToAll(message: WebSocketMessage): void;
    broadcastToRoom(roomId: string, message: WebSocketMessage): void;
    sendToUser(userId: string, message: WebSocketMessage): void;
    joinRoom(userId: string, roomId: string): void;
    leaveRoom(userId: string, roomId: string): void;
    getConnectedUsers(): string[];
    private getUserIdFromClient;
    getHealthStatus(): {
        connected: boolean;
        connectedUsers: number;
        activeRooms: number;
    };
}
