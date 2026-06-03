import {PostStatus} from '@prisma/client';
import {Request, Response} from 'express';
import {z} from 'zod';
import {adminService} from '../services/admin.service';

export const updatePostStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export const adminController = {
  async dashboard(_req: Request, res: Response) {
    return res.json({data: await adminService.getDashboard()});
  },

  async listUsers(_req: Request, res: Response) {
    return res.json({data: await adminService.listUsers()});
  },

  async deleteUser(req: Request, res: Response) {
    await adminService.deleteUser(req.params.id);
    return res.json({data: {success: true}});
  },

  async listPosts(_req: Request, res: Response) {
    return res.json({data: await adminService.listPosts()});
  },

  async updatePostStatus(req: Request, res: Response) {
    const post = await adminService.updatePostStatus(req.params.id, req.body.status as PostStatus);
    return res.json({data: post});
  },

  async deletePost(req: Request, res: Response) {
    await adminService.deletePost(req.params.id);
    return res.json({data: {success: true}});
  },

  async listVehicles(_req: Request, res: Response) {
    return res.json({data: await adminService.listVehicles()});
  },

  async deleteVehicle(req: Request, res: Response) {
    await adminService.deleteVehicle(req.params.id);
    return res.json({data: {success: true}});
  },
};
