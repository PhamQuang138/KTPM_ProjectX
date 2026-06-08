import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const imageUploadDir = path.resolve(process.cwd(), 'uploads', 'images');

fs.mkdirSync(imageUploadDir, {recursive: true});

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, imageUploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image files are allowed'));
      return;
    }

    callback(null, true);
  },
});
