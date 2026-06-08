import {Response} from 'express';
import {AuthenticatedRequest} from '../middlewares/auth';

const getPublicBaseUrl = (req: AuthenticatedRequest) =>
  process.env.PUBLIC_BACKEND_URL?.trim() || `${req.protocol}://${req.get('host')}`;

export const uploadController = {
  uploadImage(req: AuthenticatedRequest, res: Response) {
    if (!req.file) {
      return res.status(400).json({message: 'Image file is required'});
    }

    const relativeUrl = `/uploads/images/${req.file.filename}`;
    return res.status(201).json({
      data: {
        url: `${getPublicBaseUrl(req)}${relativeUrl}`,
        path: relativeUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  },
};
