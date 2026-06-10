"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_1 = require("../middlewares/auth");
const validateRequest_1 = require("../middlewares/validateRequest");
exports.messageRouter = (0, express_1.Router)();
exports.messageRouter.use(auth_1.requireAuth);
exports.messageRouter.get('/', message_controller_1.messageController.listConversations);
exports.messageRouter.post('/', (0, validateRequest_1.validateBody)(message_controller_1.startConversationSchema), message_controller_1.messageController.startConversation);
exports.messageRouter.get('/:id', message_controller_1.messageController.getConversation);
exports.messageRouter.get('/:id/messages', message_controller_1.messageController.listMessages);
exports.messageRouter.post('/:id/messages', (0, validateRequest_1.validateBody)(message_controller_1.sendMessageSchema), message_controller_1.messageController.sendMessage);
//# sourceMappingURL=message.routes.js.map