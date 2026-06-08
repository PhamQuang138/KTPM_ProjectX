import {Request, Response} from 'express';
import {articleService} from '../services/article.service';

export const articleController = {
  async list(req: Request, res: Response) {
    res.json({
      data: await articleService.list(req.query.category?.toString()),
    });
  },

  async getById(req: Request, res: Response) {
    const article = await articleService.getById(req.params.id);
    if (!article) {
      return res.status(404).json({message: 'Article not found'});
    }

    return res.json({data: article});
  },
};
