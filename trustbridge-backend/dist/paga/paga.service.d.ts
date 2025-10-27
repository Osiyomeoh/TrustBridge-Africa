import { ConfigService } from '@nestjs/config';
export declare class PagaService {
    private configService;
    private readonly logger;
    private readonly apiUrl;
    private readonly publicKey;
    private readonly secretKey;
    private readonly hashKey;
    private readonly callbackUrl;
    constructor(configService: ConfigService);
    generatePaymentCode(userId: string, amount: number): string;
    private generateHash;
    createAgentPaymentRequest(phoneNumber: string, amount: number, reference: string, description: string): Promise<{
        reference: string;
        paymentCode: string;
        ussdCode: string;
        bank: string;
        instructions: string;
    }>;
    private createSimulatedPaymentRequest;
    private formatUSSDInstructions;
    verifyPayment(reference: string): Promise<{
        verified: boolean;
        amount?: number;
        timestamp?: Date;
    }>;
    getNearbyAgents(latitude: number, longitude: number): Promise<{
        agents: Array<{
            name: string;
            address: string;
            distance: string;
            phone: string;
        }>;
    }>;
    sendPaymentInstructions(phoneNumber: string, paymentCode: string, amount: number): Promise<void>;
}
