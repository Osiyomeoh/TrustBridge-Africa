import { Request, Response, NextFunction } from 'express';
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
