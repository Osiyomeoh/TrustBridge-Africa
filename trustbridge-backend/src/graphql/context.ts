import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface Context {
  user?: {
    walletAddress: string;
    role: string;
  };
  isAuthenticated: boolean;
}

export const createContext = ({ req }: { req: Request }): Context => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { isAuthenticated: false };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    return {
      user: {
        walletAddress: decoded.walletAddress,
        role: decoded.role
      },
      isAuthenticated: true
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
};