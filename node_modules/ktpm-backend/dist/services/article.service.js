"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
exports.articleService = {
    list(category) {
        return prisma_1.prisma.article.findMany({
            where: {
                status: client_1.ArticleStatus.PUBLISHED,
                ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
            },
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        });
    },
    getById(id) {
        return prisma_1.prisma.article.findFirst({
            where: {
                id,
                status: client_1.ArticleStatus.PUBLISHED,
            },
        });
    },
};
//# sourceMappingURL=article.service.js.map