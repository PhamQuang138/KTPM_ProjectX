"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const notification_service_1 = require("../services/notification.service");
exports.notificationController = {
    async list(req, res) {
        return res.json({ data: await notification_service_1.notificationService.list(req.user.id) });
    },
    async markAllRead(req, res) {
        await notification_service_1.notificationService.markAllRead(req.user.id);
        return res.json({ data: { success: true } });
    },
};
//# sourceMappingURL=notification.controller.js.map