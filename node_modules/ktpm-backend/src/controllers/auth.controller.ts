import {Request, Response} from 'express';
import {z} from 'zod';
import {authService} from '../services/auth.service';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email or username is required').max(254),
  password: z.string().min(1, 'Password is required').max(128),
});

export const signupSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(9, 'Password must be longer than 8 characters')
    .max(128)
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
  name: z.string().trim().min(2).max(120),
  avatar: z.string().url().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(254),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email().max(254),
  code: z.string().trim().regex(/^\d{6}$/, 'Code must be 6 digits'),
  password: z
    .string()
    .min(9, 'Password must be longer than 8 characters')
    .max(128)
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
});

export const authController = {
  async signup(req: Request, res: Response) {
    const result = await authService.signup(req.body.email, req.body.password, req.body.name, req.body.avatar);
    if (!result) {
      return res.status(409).json({message: 'Email is already registered'});
    }

    return res.status(201).json({data: result});
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body.email, req.body.password);
    if (!result) {
      return res.status(401).json({message: 'Invalid email or password'});
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
        message: 'If this email exists, a password reset code has been sent.',
      },
    });
  },

  async resetPassword(req: Request, res: Response) {
    const success = await authService.resetPassword(req.body.email, req.body.code, req.body.password);
    if (!success) {
      return res.status(400).json({message: 'Invalid or expired reset code'});
    }

    return res.json({data: {success: true}});
  },
};
