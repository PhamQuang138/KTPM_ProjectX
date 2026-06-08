import {ArticleStatus} from '@prisma/client';
import {prisma} from '../config/prisma';

export const articleService = {
  list(category?: string) {
    return prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        ...(category ? {category: {equals: category, mode: 'insensitive' as const}} : {}),
      },
      orderBy: [{publishedAt: 'desc'}, {createdAt: 'desc'}],
    });
  },

  getById(id: string) {
    return prisma.article.findFirst({
      where: {
        id,
        status: ArticleStatus.PUBLISHED,
      },
    });
  },
};
