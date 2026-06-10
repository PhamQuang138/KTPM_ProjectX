"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUpload = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
exports.imageUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 4 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        const extension = path_1.default.extname(file.originalname).toLowerCase();
        if (!allowedImageMimeTypes.has(file.mimetype) || !allowedImageExtensions.has(extension)) {
            callback(new Error('Chỉ chấp nhận ảnh JPG, JPEG, PNG và WEBP'));
            return;
        }
        callback(null, true);
    },
});
//# sourceMappingURL=upload.js.map