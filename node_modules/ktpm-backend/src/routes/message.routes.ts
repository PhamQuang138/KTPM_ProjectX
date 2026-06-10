import {Router} from 'express';
import {
  messageController,
  sendMessageSchema,
  startConversationSchema,
} from '../controllers/message.controller';
import {requireAuth} from '../middlewares/auth';
import {validateBody} from '../middlewares/validateRequest';

export const messageRouter = Router();

messageRouter.use(requireAuth);
messageRouter.get('/', messageController.listConversations);
messageRouter.post('/', validateBody(startConversationSchema), messageController.startConversation);
messageRouter.get('/:id', messageController.getConversation);
messageRouter.get('/:id/messages', messageController.listMessages);
messageRouter.post('/:id/messages', validateBody(sendMessageSchema), messageController.sendMessage);
