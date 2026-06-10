"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
exports.uploadRouter = (0, express_1.Router)();
exports.uploadRouter.post('/images', auth_1.requireAuth, upload_1.imageUpload.single('image'), upload_controller_1.uploadController.uploadImage);
//# sourceMappingURL=upload.routes.js.map