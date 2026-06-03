import {articlesSeed} from '../data/seeds';

const articles = [...articlesSeed];

export const articleService = {
  list(category?: string) {
    return category ? articles.filter((article) => article.category.toLowerCase() === category.toLowerCase()) : articles;
  },

  getById(id: string) {
    return articles.find((article) => article.id === id);
  },
};
