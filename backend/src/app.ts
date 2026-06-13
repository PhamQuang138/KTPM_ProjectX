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
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter((origin): origin is string => Boolean(origin))
  .map((origin) => `https://${origin}`);
const allowedOrigins = [...corsOrigin.split(',').map((origin) => origin.trim()), ...vercelOrigins];

const isAllowedOrigin = (origin: string): boolean =>
  corsOrigin === '*' ||
  allowedOrigins.some((allowedOrigin) => {
    if (!allowedOrigin.includes('*')) return origin === allowedOrigin;

    const escapedPattern = allowedOrigin
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace('\\*', '.*');
    return new RegExp(`^${escapedPattern}$`).test(origin);
  });

export const app = express();

// Vercel forwards the real client IP through its proxy. Express-rate-limit
// requires trust proxy so it can validate and use X-Forwarded-For correctly.
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use((req, _res, next) => {
  const apiPathIndex = req.url.indexOf('/api/');

  if (apiPathIndex > 0) {
    req.url = req.url.slice(apiPathIndex);
  } else if (req.url.endsWith('/api')) {
    req.url = '/api';
  }

  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: {policy: 'cross-origin'},
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS'));
    },
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
if (!isProduction) {
  app.use(
    '/uploads',
    express.static(path.resolve(process.cwd(), 'uploads'), {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
      },
    }),
  );
}
const healthHandler = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'ktpm-backend',
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', healthHandler);
app.use('/api', apiRouter);

// Vercel Services can remove the service route prefix before invoking Express.
app.get('/health', healthHandler);
app.use('/', apiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({message: 'Route not found'});
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  if (
    error instanceof SyntaxError &&
    'status' in error &&
    (error as SyntaxError & {status?: number}).status === 400
  ) {
    return res.status(400).json({message: 'JSON không hợp lệ'});
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: error.code === 'LIMIT_FILE_SIZE' ? 'Ảnh phải có dung lượng tối đa 4MB' : error.message,
    });
  }

  if (error instanceof Error && error.message.includes('Chỉ chấp nhận ảnh')) {
    return res.status(400).json({message: error.message});
  }

  const message =
    process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error';
  res.status(500).json({message});
});

export default app;
