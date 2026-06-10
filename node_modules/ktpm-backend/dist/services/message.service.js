"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = void 0;
const prisma_1 = require("../config/prisma");
const notification_service_1 = require("./notification.service");
const participantSelect = {
    id: true,
    name: true,
    email: true,
    avatar: true,
};
const conversationInclude = {
    listing: {
        select: {
            id: true,
            title: true,
            price: true,
            vehicle: { select: { image: true } },
        },
    },
    buyer: { select: participantSelect },
    seller: { select: participantSelect },
    messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: participantSelect } },
    },
};
const messageInclude = {
    sender: { select: participantSelect },
};
exports.messageService = {
    listConversations(userId) {
        return prisma_1.prisma.conversation.findMany({
            where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
            include: conversationInclude,
            orderBy: { updatedAt: 'desc' },
        });
    },
    async startConversation(listingId, buyerId) {
        const listing = await prisma_1.prisma.vehicleListing.findUnique({
            where: { id: listingId },
            select: { id: true, sellerId: true },
        });
        if (!listing)
            return null;
        if (listing.sellerId === buyerId) {
            throw new Error('SELF_CONVERSATION');
        }
        return prisma_1.prisma.conversation.upsert({
            where: {
                listingId_buyerId_sellerId: {
                    listingId,
                    buyerId,
                    sellerId: listing.sellerId,
                },
            },
            create: { listingId, buyerId, sellerId: listing.sellerId },
            update: {},
            include: conversationInclude,
        });
    },
    async startDirectConversation(userId, currentUserId) {
        if (userId === currentUserId)
            throw new Error('SELF_CONVERSATION');
        const target = await prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
        if (!target)
            return null;
        const [buyerId, sellerId] = [currentUserId, userId].sort();
        const directKey = `${buyerId}:${sellerId}`;
        return prisma_1.prisma.conversation.upsert({
            where: { directKey },
            create: { directKey, buyerId, sellerId },
            update: {},
            include: conversationInclude,
        });
    },
    getConversation(id, userId) {
        return prisma_1.prisma.conversation.findFirst({
            where: { id, OR: [{ buyerId: userId }, { sellerId: userId }] },
            include: conversationInclude,
        });
    },
    async listMessages(conversationId, userId) {
        const conversation = await prisma_1.prisma.conversation.findFirst({
            where: { id: conversationId, OR: [{ buyerId: userId }, { sellerId: userId }] },
            select: { id: true },
        });
        if (!conversation)
            return null;
        await prisma_1.prisma.message.updateMany({
            where: { conversationId, senderId: { not: userId }, readAt: null },
            data: { readAt: new Date() },
        });
        return prisma_1.prisma.message.findMany({
            where: { conversationId },
            include: messageInclude,
            orderBy: { createdAt: 'asc' },
            take: 200,
        });
    },
    async sendMessage(conversationId, senderId, content) {
        const conversation = await prisma_1.prisma.conversation.findFirst({
            where: { id: conversationId, OR: [{ buyerId: senderId }, { sellerId: senderId }] },
            select: { id: true, buyerId: true, sellerId: true, listingId: true },
        });
        if (!conversation)
            return null;
        return prisma_1.prisma.$transaction(async (tx) => {
            const message = await tx.message.create({
                data: { conversationId, senderId, content },
                include: messageInclude,
            });
            await tx.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            });
            const recipientId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;
            await notification_service_1.notificationService.create({
                recipientId,
                actorId: senderId,
                type: 'message',
                title: 'Tin nhắn mới',
                message: conversation.listingId ? 'Đã gửi tin nhắn về một tin chợ xe' : 'Đã gửi cho bạn một tin nhắn',
                link: `/profile/${senderId}`,
            });
            return message;
        });
    },
};
//# sourceMappingURL=message.service.js.map