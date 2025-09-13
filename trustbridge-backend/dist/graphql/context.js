"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createContext = ({ req }) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return { isAuthenticated: false };
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        return {
            user: {
                walletAddress: decoded.walletAddress,
                role: decoded.role
            },
            isAuthenticated: true
        };
    }
    catch (error) {
        return { isAuthenticated: false };
    }
};
exports.createContext = createContext;
//# sourceMappingURL=context.js.map