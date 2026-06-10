"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const prisma_1 = require("../config/prisma");
exports.notificationService = {
    create(input) {
        if (input.actorId && input.actorId === input.recipientId)
            return Promise.resolve(null);
        return prisma_1.prisma.notification.create({ data: input });
    },
    async list(userId) {
        const [items, unreadCount] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where: { recipientId: userId },
                include: { actor: { select: { id: true, name: true, email: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                take: 50,
            }),
            prisma_1.prisma.notification.count({ where: { recipientId: userId, readAt: null } }),
        ]);
        return { items, unreadCount };
    },
    markAllRead(userId) {
        return prisma_1.prisma.notification.updateMany({
            where: { recipientId: userId, readAt: null },
            data: { readAt: new Date() },
        });
    },
};
//# sourceMappingURL=notification.service.js.map