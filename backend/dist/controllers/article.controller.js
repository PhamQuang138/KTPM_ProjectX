"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleController = void 0;
const article_service_1 = require("../services/article.service");
exports.articleController = {
    async list(req, res) {
        res.json({
            data: await article_service_1.articleService.list(req.query.category?.toString()),
        });
    },
    async getById(req, res) {
        const article = await article_service_1.articleService.getById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        return res.json({ data: article });
    },
};
//# sourceMappingURL=article.controller.js.map