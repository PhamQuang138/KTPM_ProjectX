"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const blob_1 = require("@vercel/blob");
const crypto_1 = __importDefault(require("crypto"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const saveLocalImage = async (req) => {
    const extension = path_1.default.extname(req.file.originalname).toLowerCase();
    const filename = `${Date.now()}-${crypto_1.default.randomUUID()}${extension}`;
    const relativePath = `/uploads/images/${filename}`;
    const directory = path_1.default.resolve(process.cwd(), 'uploads', 'images');
    await promises_1.default.mkdir(directory, { recursive: true });
    await promises_1.default.writeFile(path_1.default.join(directory, filename), req.file.buffer);
    return {
        url: `${req.protocol}://${req.get('host')}${relativePath}`,
        path: relativePath,
        publicId: relativePath,
        filename,
    };
};
const usesRemoteDatabase = () => {
    const databaseUrl = process.env.DATABASE_URL ?? '';
    return Boolean(databaseUrl) && !/(localhost|127\.0\.0\.1)/i.test(databaseUrl);
};
exports.uploadController = {
    async uploadImage(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
            }
            if ((process.env.NODE_ENV === 'production' || usesRemoteDatabase()) && !process.env.BLOB_READ_WRITE_TOKEN) {
                return res.status(503).json({
                    message: 'Chưa cấu hình BLOB_READ_WRITE_TOKEN. Không thể lưu ảnh local khi đang dùng cơ sở dữ liệu cloud.',
                });
            }
            const extension = path_1.default.extname(req.file.originalname).toLowerCase();
            const safeBaseName = path_1.default
                .basename(req.file.originalname, extension)
                .normalize('NFKD')
                .replace(/[^\w-]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 80) || 'image';
            const storedImage = process.env.BLOB_READ_WRITE_TOKEN
                ? await (0, blob_1.put)(`images/${safeBaseName}${extension}`, req.file.buffer, {
                    access: 'public',
                    addRandomSuffix: true,
                    contentType: req.file.mimetype,
                }).then((blob) => ({
                    url: blob.url,
                    path: blob.pathname,
                    publicId: blob.pathname,
                    filename: blob.pathname.split('/').pop() ?? req.file.originalname,
                }))
                : await saveLocalImage(req);
            return res.status(201).json({
                data: {
                    ...storedImage,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                },
            });
        }
        catch (error) {
            return next(error);
        }
    },
};
//# sourceMappingURL=upload.controller.js.map