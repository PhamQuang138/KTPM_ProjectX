import {Response} from 'express';
import {z} from 'zod';
import {AuthenticatedRequest} from '../middlewares/auth';
import {messageService} from '../services/message.service';

export const startConversationSchema = z.object({
  listingId: z.string().uuid(),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Tin nhắn không được để trống').max(4000),
});

export const messageController = {
  async listConversations(req: AuthenticatedRequest, res: Response) {
    return res.json({data: await messageService.listConversations(req.user!.id)});
  },

  async startConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const conversation = await messageService.startConversation(req.body.listingId, req.user!.id);
      if (!conversation) return res.status(404).json({message: 'Không tìm thấy tin đăng'});
      return res.status(201).json({data: conversation});
    } catch (error) {
      if (error instanceof Error && error.message === 'SELF_CONVERSATION') {
        return res.status(400).json({message: 'Bạn không thể tự nhắn tin cho chính mình'});
      }
      throw error;
    }
  },

  async getConversation(req: AuthenticatedRequest, res: Response) {
    const conversation = await messageService.getConversation(req.params.id, req.user!.id);
    if (!conversation) return res.status(404).json({message: 'Không tìm thấy cuộc trò chuyện'});
    return res.json({data: conversation});
  },

  async listMessages(req: AuthenticatedRequest, res: Response) {
    const messages = await messageService.listMessages(req.params.id, req.user!.id);
    if (!messages) return res.status(404).json({message: 'Không tìm thấy cuộc trò chuyện'});
    return res.json({data: messages});
  },

  async sendMessage(req: AuthenticatedRequest, res: Response) {
    const message = await messageService.sendMessage(req.params.id, req.user!.id, req.body.content);
    if (!message) return res.status(404).json({message: 'Không tìm thấy cuộc trò chuyện'});
    return res.status(201).json({data: message});
  },
};
