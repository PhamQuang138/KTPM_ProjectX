"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.signupSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().min(1, 'Email or username is required').max(254),
    password: zod_1.z.string().min(1, 'Password is required').max(128),
});
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email().max(254),
    password: zod_1.z
        .string()
        .min(9, 'Password must be longer than 8 characters')
        .max(128)
        .regex(/[a-z]/, 'Password must include a lowercase letter')
        .regex(/[A-Z]/, 'Password must include an uppercase letter')
        .regex(/[0-9]/, 'Password must include a number')
        .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
    name: zod_1.z.string().trim().min(2).max(120),
    avatar: zod_1.z.string().url().optional(),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email().max(254),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email().max(254),
    code: zod_1.z.string().trim().regex(/^\d{6}$/, 'Code must be 6 digits'),
    password: zod_1.z
        .string()
        .min(9, 'Password must be longer than 8 characters')
        .max(128)
        .regex(/[a-z]/, 'Password must include a lowercase letter')
        .regex(/[A-Z]/, 'Password must include an uppercase letter')
        .regex(/[0-9]/, 'Password must include a number')
        .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
});
exports.authController = {
    async signup(req, res) {
        const result = await auth_service_1.authService.signup(req.body.email, req.body.password, req.body.name, req.body.avatar);
        if (!result) {
            return res.status(409).json({ message: 'Email is already registered' });
        }
        return res.status(201).json({ data: result });
    },
    async login(req, res) {
        const result = await auth_service_1.authService.login(req.body.email, req.body.password);
        if (!result) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        return res.json({ data: result });
    },
    logout(_req, res) {
        // JWT logout is handled client-side by removing the token.
        // Add token blocklisting here if the product later requires server-side revocation.
        return res.json({ data: { success: true } });
    },
    async forgotPassword(req, res) {
        await auth_service_1.authService.requestPasswordReset(req.body.email);
        return res.json({
            data: {
                success: true,
                message: 'If this email exists, a password reset code has been sent.',
            },
        });
    },
    async resetPassword(req, res) {
        const success = await auth_service_1.authService.resetPassword(req.body.email, req.body.code, req.body.password);
        if (!success) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }
        return res.json({ data: { success: true } });
    },
};
//# sourceMappingURL=auth.controller.js.map