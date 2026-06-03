import {Request, Response} from 'express';
import {articleService} from '../services/article.service';

export const articleController = {
  list(req: Request, res: Response) {
    res.json({
      data: articleService.list(req.query.category?.toString()),
    });
  },

  getById(req: Request, res: Response) {
    const article = articleService.getById(req.params.id);
    if (!article) {
      return res.status(404).json({message: 'Article not found'});
    }

    return res.json({data: article});
  },
};
