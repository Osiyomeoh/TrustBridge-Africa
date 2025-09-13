"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map