import cors from 'cors';
import express, {NextFunction, Request, Response} from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import multer from 'multer';
import path from 'path';
import {apiRouter} from './routes';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
const isProduction = process.env.NODE_ENV === 'production';

export const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {policy: 'cross-origin'},
  }),
);
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: parseNumber(process.env.RATE_LIMIT_MAX, isProduction ? 100 : 5000),
    message: {message: 'Too many requests. Please wait a moment and try again.'},
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !isProduction || req.method === 'OPTIONS' || req.path === '/api/health',
  }),
);
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({extended: true}));
app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  }),
);

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'ktpm-backend',
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({message: 'Route not found'});
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : error.message,
    });
  }

  if (error instanceof Error && error.message === 'Only image files are allowed') {
    return res.status(400).json({message: error.message});
  }

  const message =
    process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error';
  res.status(500).json({message});
});
