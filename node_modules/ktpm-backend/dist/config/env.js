"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseUrl = exports.getJwtSecret = void 0;
const DEFAULT_JWT_SECRET = 'change-me-in-production';
const requireValue = (name) => {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`${name} is required`);
    }
    return value;
};
const getJwtSecret = () => {
    const secret = requireValue('JWT_SECRET');
    if (secret === DEFAULT_JWT_SECRET || secret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters and must not use the example value');
    }
    return secret;
};
exports.getJwtSecret = getJwtSecret;
const getDatabaseUrl = () => requireValue('DATABASE_URL');
exports.getDatabaseUrl = getDatabaseUrl;
//# sourceMappingURL=env.js.map