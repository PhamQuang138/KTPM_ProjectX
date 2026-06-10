import {put} from '@vercel/blob';
import crypto from 'crypto';
import {NextFunction, Response} from 'express';
import fs from 'fs/promises';
import path from 'path';
import {AuthenticatedRequest} from '../middlewares/auth';

const saveLocalImage = async (req: AuthenticatedRequest) => {
  const extension = path.extname(req.file!.originalname).toLowerCase();
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const relativePath = `/uploads/images/${filename}`;
  const directory = path.resolve(process.cwd(), 'uploads', 'images');

  await fs.mkdir(directory, {recursive: true});
  await fs.writeFile(path.join(directory, filename), req.file!.buffer);

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

export const uploadController = {
  async uploadImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({message: 'Vui lòng chọn file ảnh'});
      }

      if ((process.env.NODE_ENV === 'production' || usesRemoteDatabase()) && !process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(503).json({
          message:
            'Chưa cấu hình BLOB_READ_WRITE_TOKEN. Không thể lưu ảnh local khi đang dùng cơ sở dữ liệu cloud.',
        });
      }

      const extension = path.extname(req.file.originalname).toLowerCase();
      const safeBaseName =
        path
          .basename(req.file.originalname, extension)
          .normalize('NFKD')
          .replace(/[^\w-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 80) || 'image';

      const storedImage = process.env.BLOB_READ_WRITE_TOKEN
        ? await put(`images/${safeBaseName}${extension}`, req.file.buffer, {
            access: 'public',
            addRandomSuffix: true,
            contentType: req.file.mimetype,
          }).then((blob) => ({
            url: blob.url,
            path: blob.pathname,
            publicId: blob.pathname,
            filename: blob.pathname.split('/').pop() ?? req.file!.originalname,
          }))
        : await saveLocalImage(req);

      return res.status(201).json({
        data: {
          ...storedImage,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};
