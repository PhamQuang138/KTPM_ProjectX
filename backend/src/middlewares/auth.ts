import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {prisma} from '../config/prisma';
import {getJwtSecret} from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({message: 'Vui l?ng ??ng nh?p'});
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as {sub?: string};
    if (!payload.sub) {
      return res.status(401).json({message: 'Phi?n ??ng nh?p kh?ng h?p l?'});
    }

    const user = await prisma.user.findUnique({
      where: {id: payload.sub},
      select: {id: true, email: true, name: true, role: true},
    });

    if (!user) {
      return res.status(401).json({message: 'Kh?ng t?m th?y ng??i d?ng'});
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({message: 'Phi?n ??ng nh?p kh?ng h?p l?'});
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, getJwtSecret()) as {sub?: string};
    if (!payload.sub) return next();

    const user = await prisma.user.findUnique({
      where: {id: payload.sub},
      select: {id: true, email: true, name: true, role: true},
    });
    if (user) req.user = user;
  } catch {
    // Public routes remain readable when an optional token is invalid.
  }

  return next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({message: 'B?n c?n quy?n qu?n tr? vi?n'});
  }

  return next();
};
