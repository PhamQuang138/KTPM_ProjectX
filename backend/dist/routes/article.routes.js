"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleRouter = void 0;
const express_1 = require("express");
const article_controller_1 = require("../controllers/article.controller");
exports.articleRouter = (0, express_1.Router)();
exports.articleRouter.get('/', article_controller_1.articleController.list);
exports.articleRouter.get('/:id', article_controller_1.articleController.getById);
//# sourceMappingURL=article.routes.js.map