import { Request } from 'express';
export interface Context {
    user?: {
        walletAddress: string;
        role: string;
    };
    isAuthenticated: boolean;
}
export declare const createContext: ({ req }: {
    req: Request;
}) => Context;
