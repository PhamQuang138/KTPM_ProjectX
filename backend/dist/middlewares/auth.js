"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.optionalAuth = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
const requireAuth = async (req, res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, (0, env_1.getJwtSecret)());
        if (!payload.sub) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, name: true, role: true },
        });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.requireAuth = requireAuth;
const optionalAuth = async (req, _res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token)
        return next();
    try {
        const payload = jsonwebtoken_1.default.verify(token, (0, env_1.getJwtSecret)());
        if (!payload.sub)
            return next();
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, name: true, role: true },
        });
        if (user)
            req.user = user;
    }
    catch {
        // Public routes remain readable when an optional token is invalid.
    }
    return next();
};
exports.optionalAuth = optionalAuth;
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    return next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map