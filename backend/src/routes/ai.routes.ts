import {Router} from 'express';
import {aiChatSchema, aiController} from '../controllers/ai.controller';
import {requireAuth} from '../middlewares/auth';
import {validateBody} from '../middlewares/validateRequest';

export const aiRouter = Router();

aiRouter.post('/chat', requireAuth, validateBody(aiChatSchema), aiController.chat);
