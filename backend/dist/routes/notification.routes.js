"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middlewares/auth");
exports.notificationRouter = (0, express_1.Router)();
exports.notificationRouter.use(auth_1.requireAuth);
exports.notificationRouter.get('/', notification_controller_1.notificationController.list);
exports.notificationRouter.post('/read-all', notification_controller_1.notificationController.markAllRead);
//# sourceMappingURL=notification.routes.js.map