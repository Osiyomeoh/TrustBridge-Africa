import { EventEmitter2 } from '@nestjs/event-emitter';
export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: Date;
    userId?: string;
    room?: string;
}
export interface WebSocketRoom {
    id: string;
    name: string;
    users: Set<string>;
    createdAt: Date;
}
export declare class WebSocketService {
    private eventEmitter;
    private readonly logger;
    private readonly rooms;
    constructor(eventEmitter: EventEmitter2);
    private setupEventListeners;
    broadcastToAll(message: WebSocketMessage): Promise<void>;
    broadcastToRoom(roomId: string, message: WebSocketMessage): Promise<void>;
    sendToUser(userId: string, message: WebSocketMessage): Promise<void>;
    joinRoom(userId: string, roomId: string): Promise<void>;
    leaveRoom(userId: string, roomId: string): Promise<void>;
    getConnectedUsers(): Promise<string[]>;
    getRoomUsers(roomId: string): Promise<string[]>;
    getRooms(): Promise<WebSocketRoom[]>;
    getRoomStats(): Promise<{
        totalRooms: number;
        totalUsers: number;
        roomDetails: Array<{
            id: string;
            name: string;
            userCount: number;
            createdAt: Date;
        }>;
    }>;
    broadcastVerificationUpdate(assetId: string, status: string, score?: number): Promise<void>;
    broadcastInvestmentUpdate(investmentId: string, status: string, returns?: number): Promise<void>;
    broadcastAssetUpdate(assetId: string, status: string, verificationScore?: number): Promise<void>;
    broadcastMarketUpdate(assetType: string, price: number, change: number): Promise<void>;
    broadcastBlockchainUpdate(transactionId: string, status: string, gasUsed?: number): Promise<void>;
    broadcastSystemAlert(alertType: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void>;
    notifyUserAssetUpdate(userId: string, assetId: string, status: string): Promise<void>;
    notifyUserInvestmentUpdate(userId: string, investmentId: string, status: string, returns?: number): Promise<void>;
    notifyUserVerificationUpdate(userId: string, assetId: string, status: string, score?: number): Promise<void>;
    private getRoomDisplayName;
    getHealthStatus(): Promise<{
        connected: boolean;
        connectedUsers: number;
        activeRooms: number;
        uptime: number;
    }>;
}
