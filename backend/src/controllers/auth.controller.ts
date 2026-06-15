import {Request, Response} from 'express';
import {z} from 'zod';
import {authService} from '../services/auth.service';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Vui l?ng nh?p email ho?c t?n admin').max(254),
  password: z.string().min(1, 'Vui l?ng nh?p m?t kh?u').max(128),
});

export const signupSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(9, 'M?t kh?u ph?i d?i h?n 8 k? t?')
    .max(128)
    .regex(/[a-z]/, 'M?t kh?u ph?i c? ch? th??ng')
    .regex(/[A-Z]/, 'M?t kh?u ph?i c? ch? in hoa')
    .regex(/[0-9]/, 'M?t kh?u ph?i c? ch? s?')
    .regex(/[^A-Za-z0-9]/, 'M?t kh?u ph?i c? k? t? ??c bi?t'),
  name: z.string().trim().min(2).max(120),
  avatar: z.string().url().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(254),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email().max(254),
  code: z.string().trim().regex(/^\d{6}$/, 'M? x?c th?c ph?i g?m 6 ch? s?'),
  password: z
    .string()
    .min(9, 'M?t kh?u ph?i d?i h?n 8 k? t?')
    .max(128)
    .regex(/[a-z]/, 'M?t kh?u ph?i c? ch? th??ng')
    .regex(/[A-Z]/, 'M?t kh?u ph?i c? ch? in hoa')
    .regex(/[0-9]/, 'M?t kh?u ph?i c? ch? s?')
    .regex(/[^A-Za-z0-9]/, 'M?t kh?u ph?i c? k? t? ??c bi?t'),
});

export const authController = {
  async signup(req: Request, res: Response) {
    const result = await authService.signup(req.body.email, req.body.password, req.body.name, req.body.avatar);
    if (!result) {
      return res.status(409).json({message: 'Email n?y ?? ???c ??ng k?'});
    }

    return res.status(201).json({data: result});
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body.email, req.body.password);
    if (!result) {
      return res.status(401).json({message: 'Email ho?c m?t kh?u kh?ng ??ng'});
    }

    return res.json({data: result});
  },

  logout(_req: Request, res: Response) {
    // JWT logout is handled client-side by removing the token.
    // Add token blocklisting here if the product later requires server-side revocation.
    return res.json({data: {success: true}});
  },

  async forgotPassword(req: Request, res: Response) {
    await authService.requestPasswordReset(req.body.email);
    return res.json({
      data: {
        success: true,
        message: 'N?u email t?n t?i, m? ??t l?i m?t kh?u ?? ???c g?i.',
      },
    });
  },

  async resetPassword(req: Request, res: Response) {
    const success = await authService.resetPassword(req.body.email, req.body.code, req.body.password);
    if (!success) {
      return res.status(400).json({message: 'M? ??t l?i m?t kh?u kh?ng ??ng ho?c ?? h?t h?n'});
    }

    return res.json({data: {success: true}});
  },
};
