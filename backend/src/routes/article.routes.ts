import {Router} from 'express';
import {articleController} from '../controllers/article.controller';

export const articleRouter = Router();

articleRouter.get('/', articleController.list);
articleRouter.get('/:id', articleController.getById);
