import path from 'path';
import multer from 'multer';

const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedImageMimeTypes.has(file.mimetype) || !allowedImageExtensions.has(extension)) {
      callback(new Error('Chỉ chấp nhận ảnh JPG, JPEG, PNG và WEBP'));
      return;
    }

    callback(null, true);
  },
});
