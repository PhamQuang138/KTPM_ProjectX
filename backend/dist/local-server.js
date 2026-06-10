"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/localEnv");
const pino_1 = __importDefault(require("pino"));
const app_1 = require("./app");
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL ?? 'info',
});
const requestedPort = Number(process.env.PORT ?? 4000);
const server = app_1.app.listen(requestedPort, () => {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : requestedPort;
    logger.info({
        port,
        environment: process.env.NODE_ENV ?? 'development',
    }, `Backend server is running at http://localhost:${port}`);
});
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        logger.error({ port: requestedPort }, `Port ${requestedPort} is already in use. Stop the old backend process or set another PORT in backend/.env.`);
        process.exit(1);
    }
    throw error;
});
const shutdown = (signal) => {
    logger.info({ signal }, 'Shutting down backend server');
    server.close(() => {
        logger.info('Backend server stopped');
        process.exit(0);
    });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
//# sourceMappingURL=local-server.js.map