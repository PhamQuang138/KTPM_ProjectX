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
      return res.json({
        data: await aiService.chat(req.body.message, req.body.imageUrl),
      });
    } catch (error) {
      const errorText = error instanceof Error ? error.message : String(error);

      console.error('AI CHAT ERROR:', error);

      if (
        errorText.includes('RESOURCE_EXHAUSTED') ||
        errorText.includes('Quota exceeded') ||
        errorText.includes('429')
      ) {
        return res.status(429).json({
          message:
            'Gemini đã hết quota miễn phí hoặc bị giới hạn tốc độ. Vui lòng thử lại sau hoặc đổi model/nâng hạn mức.',
        });
      }

      if (error instanceof Error && error.message === 'GEMINI_NOT_CONFIGURED') {
        return res.status(503).json({
          message: 'Chatbot chưa được cấu hình GEMINI_API_KEY',
        });
      }

      if (error instanceof Error && error.message.startsWith('IMAGE_')) {
        return res.status(400).json({
          message: 'Không thể sử dụng ảnh này để tìm kiếm',
        });
      }

      return res.status(500).json({
        message: errorText || 'Lỗi không xác định từ AI',
      });
    }
  },
};