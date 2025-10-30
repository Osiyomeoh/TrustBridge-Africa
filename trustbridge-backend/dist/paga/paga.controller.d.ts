import { PagaService } from './paga.service';
export declare class PagaController {
    private readonly pagaService;
    private readonly logger;
    constructor(pagaService: PagaService);
    createPayment(body: {
        phoneNumber: string;
        amount: number;
        description: string;
        userId: string;
    }): Promise<{
        success: boolean;
        data: {
            reference: string;
            paymentCode: string;
            ussdCode: string;
            bank: string;
            instructions: string;
        };
    }>;
    verifyPayment(reference: string): Promise<{
        success: boolean;
        data: {
            verified: boolean;
            amount?: number;
            timestamp?: Date;
        };
    }>;
    getNearbyAgents(lat: string, lng: string): Promise<{
        success: boolean;
        data: {
            agents: Array<{
                name: string;
                address: string;
                distance: string;
                phone: string;
            }>;
        };
    }>;
    handleWebhook(body: any): Promise<{
        success: boolean;
        message: string;
        paymentStatus?: undefined;
    } | {
        success: boolean;
        message: string;
        paymentStatus: any;
    }>;
}
