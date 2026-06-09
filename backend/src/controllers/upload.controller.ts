import {NextFunction, Response} from 'express';
import {put} from '@vercel/blob';
import crypto from 'crypto';
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
    filename,
  };
};

export const uploadController = {
  async uploadImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({message: 'Vui lòng chọn file ảnh'});
      }

      if (process.env.NODE_ENV === 'production' && !process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error('BLOB_READ_WRITE_TOKEN chưa được cấu hình cho môi trường production');
      }

      const storedImage =
        process.env.BLOB_READ_WRITE_TOKEN
          ? await put(`images/${req.file.originalname}`, req.file.buffer, {
              access: 'public',
              addRandomSuffix: true,
              contentType: req.file.mimetype,
            }).then((blob) => ({
              url: blob.url,
              path: blob.pathname,
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
