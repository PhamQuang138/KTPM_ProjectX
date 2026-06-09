import {Response} from 'express';
import {AuthenticatedRequest} from '../middlewares/auth';
import {notificationService} from '../services/notification.service';

export const notificationController = {
  async list(req: AuthenticatedRequest, res: Response) {
    return res.json({data: await notificationService.list(req.user!.id)});
  },

  async markAllRead(req: AuthenticatedRequest, res: Response) {
    await notificationService.markAllRead(req.user!.id);
    return res.json({data: {success: true}});
  },
};
