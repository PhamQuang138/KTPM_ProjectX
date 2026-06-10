"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("./routes");
const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
const isProduction = process.env.NODE_ENV === 'production';
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter((origin) => Boolean(origin))
    .map((origin) => `https://${origin}`);
const allowedOrigins = [...corsOrigin.split(',').map((origin) => origin.trim()), ...vercelOrigins];
const isAllowedOrigin = (origin) => corsOrigin === '*' ||
    allowedOrigins.some((allowedOrigin) => {
        if (!allowedOrigin.includes('*'))
            return origin === allowedOrigin;
        const escapedPattern = allowedOrigin
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace('\\*', '.*');
        return new RegExp(`^${escapedPattern}$`).test(origin);
    });
exports.app = (0, express_1.default)();
exports.app.use((req, _res, next) => {
    const apiPathIndex = req.url.indexOf('/api/');
    if (apiPathIndex > 0) {
        req.url = req.url.slice(apiPathIndex);
    }
    else if (req.url.endsWith('/api')) {
        req.url = '/api';
    }
    next();
});
exports.app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
exports.app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
}));
exports.app.use((0, express_rate_limit_1.default)({
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: parseNumber(process.env.RATE_LIMIT_MAX, isProduction ? 100 : 5000),
    message: { message: 'Too many requests. Please wait a moment and try again.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !isProduction || req.method === 'OPTIONS' || req.path === '/api/health',
}));
exports.app.use(express_1.default.json({ limit: '5mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
if (!isProduction) {
    exports.app.use('/uploads', express_1.default.static(path_1.default.resolve(process.cwd(), 'uploads'), {
        setHeaders: (res) => {
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.setHeader('Access-Control-Allow-Origin', '*');
        },
    }));
}
const healthHandler = (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'ktpm-backend',
        environment: process.env.NODE_ENV ?? 'development',
        timestamp: new Date().toISOString(),
    });
};
exports.app.get('/api/health', healthHandler);
exports.app.use('/api', routes_1.apiRouter);
// Vercel Services can remove the service route prefix before invoking Express.
exports.app.get('/health', healthHandler);
exports.app.use('/', routes_1.apiRouter);
exports.app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
exports.app.use((error, _req, res, _next) => {
    console.error(error);
    if (error instanceof SyntaxError &&
        'status' in error &&
        error.status === 400) {
        return res.status(400).json({ message: 'JSON không hợp lệ' });
    }
    if (error instanceof multer_1.default.MulterError) {
        return res.status(400).json({
            message: error.code === 'LIMIT_FILE_SIZE' ? 'Ảnh phải có dung lượng tối đa 4MB' : error.message,
        });
    }
    if (error instanceof Error && error.message.includes('Chỉ chấp nhận ảnh')) {
        return res.status(400).json({ message: error.message });
    }
    const message = process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
});
exports.default = exports.app;
//# sourceMappingURL=app.js.map