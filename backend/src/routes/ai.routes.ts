import {Router} from 'express';
import {aiChatSchema, aiController} from '../controllers/ai.controller';
import {validateBody} from '../middlewares/validateRequest';

export const aiRouter = Router();

aiRouter.post('/chat', validateBody(aiChatSchema), aiController.chat);