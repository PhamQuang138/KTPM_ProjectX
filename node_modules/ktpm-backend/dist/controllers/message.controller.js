"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = exports.sendMessageSchema = exports.startConversationSchema = void 0;
const zod_1 = require("zod");
const message_service_1 = require("../services/message.service");
exports.startConversationSchema = zod_1.z.object({
    listingId: zod_1.z.string().uuid().optional(),
    userId: zod_1.z.string().uuid().optional(),
}).refine((input) => Boolean(input.listingId || input.userId), {
    message: 'Cần có tin đăng hoặc người nhận',
});
exports.sendMessageSchema = zod_1.z.object({
    content: zod_1.z.string().trim().min(1, 'Tin nhắn không được để trống').max(4000),
});
exports.messageController = {
    async listConversations(req, res) {
        return res.json({ data: await message_service_1.messageService.listConversations(req.user.id) });
    },
    async startConversation(req, res) {
        try {
            const conversation = req.body.listingId
                ? await message_service_1.messageService.startConversation(req.body.listingId, req.user.id)
                : await message_service_1.messageService.startDirectConversation(req.body.userId, req.user.id);
            if (!conversation)
                return res.status(404).json({ message: 'Không tìm thấy tin đăng' });
            return res.status(201).json({ data: conversation });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'SELF_CONVERSATION') {
                return res.status(400).json({ message: 'Bạn không thể tự nhắn tin cho chính mình' });
            }
            throw error;
        }
    },
    async getConversation(req, res) {
        const conversation = await message_service_1.messageService.getConversation(req.params.id, req.user.id);
        if (!conversation)
            return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
        return res.json({ data: conversation });
    },
    async listMessages(req, res) {
        const messages = await message_service_1.messageService.listMessages(req.params.id, req.user.id);
        if (!messages)
            return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
        return res.json({ data: messages });
    },
    async sendMessage(req, res) {
        const message = await message_service_1.messageService.sendMessage(req.params.id, req.user.id, req.body.content);
        if (!message)
            return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
        return res.status(201).json({ data: message });
    },
};
//# sourceMappingURL=message.controller.js.map