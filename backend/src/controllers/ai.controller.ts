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

      if (errorText.includes('OPENROUTER_HTTP_429')) {
        return res.status(429).json({
          message:
            'OpenRouter đang giới hạn tốc độ hoặc model miễn phí tạm hết năng lực. Vui lòng thử lại sau.',
        });
      }

      if (error instanceof Error && error.message === 'OPENROUTER_NOT_CONFIGURED') {
        return res.status(503).json({
          message: 'Chatbot chưa được cấu hình OPENROUTER_API_KEY',
        });
      }

      if (error instanceof Error && error.message.startsWith('IMAGE_')) {
        return res.status(400).json({
          message: 'Không thể sử dụng ảnh này để tìm kiếm',
        });
      }

      if (errorText.startsWith('OPENROUTER_HTTP_')) {
        return res.status(502).json({
          message: 'OpenRouter không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.',
        });
      }

      return res.status(500).json({
        message: errorText || 'Lỗi không xác định từ AI',
      });
    }
  },
};
