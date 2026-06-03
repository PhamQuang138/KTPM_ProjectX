import {Request, Response} from 'express';
import {z} from 'zod';
import {authService} from '../services/auth.service';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(120),
  avatar: z.string().url().optional(),
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
};
