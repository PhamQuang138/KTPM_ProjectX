import {Response} from 'express';
import {z} from 'zod';
import {AuthenticatedRequest} from '../middlewares/auth';
import {aiService} from '../services/ai.service';

export const aiChatSchema = z.object({
  message: z.string().trim().max(2000).default(''),
  imageUrl: z.string().url().max(2048).optional(),
}).refine((input) => Boolean(input.message || input.imageUrl), {
  message: 'Cần nhập câu hỏi hoặc chọn một ảnh',
});

export const aiController = {
  async chat(req: AuthenticatedRequest, res: Response) {
    try {
      return res.json({data: await aiService.chat(req.body.message, req.body.imageUrl)});
    } catch (error) {
      if (error instanceof Error && error.message === 'GEMINI_NOT_CONFIGURED') {
        return res.status(503).json({message: 'Chatbot chưa được cấu hình GEMINI_API_KEY'});
      }
      if (error instanceof Error && error.message.startsWith('IMAGE_')) {
        return res.status(400).json({message: 'Không thể sử dụng ảnh này để tìm kiếm'});
      }
      throw error;
    }
  },
};
