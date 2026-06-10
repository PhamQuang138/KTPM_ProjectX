"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
const mail_service_1 = require("./mail.service");
const PASSWORD_RESET_EXPIRES_MS = 10 * 60 * 1000;
const createResetCode = () => (0, crypto_1.randomInt)(100000, 1000000).toString();
exports.authService = {
    async signup(email, password, name, avatar) {
        const normalizedEmail = email.toLowerCase();
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
            select: {
                id: true,
            },
        });
        if (existingUser) {
            return undefined;
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: normalizedEmail,
                password: passwordHash,
                name,
                avatar,
            },
        });
        const options = {
            expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d'),
        };
        const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, (0, env_1.getJwtSecret)(), {
            ...options,
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                isVerifiedProfessional: user.isVerifiedProfessional,
            },
        };
    },
    async login(email, password) {
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                email: email.toLowerCase(),
            },
        });
        if (!user) {
            return undefined;
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return undefined;
        }
        const options = {
            expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d'),
        };
        const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email }, (0, env_1.getJwtSecret)(), {
            ...options,
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                isVerifiedProfessional: user.isVerifiedProfessional,
            },
        };
    },
    async requestPasswordReset(email) {
        const normalizedEmail = email.toLowerCase();
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true },
        });
        if (!user) {
            return;
        }
        const code = createResetCode();
        const codeHash = await bcrypt_1.default.hash(code, 10);
        const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS);
        await prisma_1.prisma.passwordResetToken.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: new Date() },
        });
        await prisma_1.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                codeHash,
                expiresAt,
            },
        });
        await mail_service_1.mailService.sendPasswordResetCode(user.email, code);
    },
    async resetPassword(email, code, newPassword) {
        const normalizedEmail = email.toLowerCase();
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
        });
        if (!user) {
            return false;
        }
        const tokens = await prisma_1.prisma.passwordResetToken.findMany({
            where: {
                userId: user.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
        });
        for (const token of tokens) {
            const isValid = await bcrypt_1.default.compare(code, token.codeHash);
            if (!isValid)
                continue;
            await prisma_1.prisma.$transaction([
                prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: { password: await bcrypt_1.default.hash(newPassword, 10) },
                }),
                prisma_1.prisma.passwordResetToken.update({
                    where: { id: token.id },
                    data: { usedAt: new Date() },
                }),
                prisma_1.prisma.passwordResetToken.updateMany({
                    where: { userId: user.id, usedAt: null },
                    data: { usedAt: new Date() },
                }),
            ]);
            return true;
        }
        return false;
    },
};
//# sourceMappingURL=auth.service.js.map