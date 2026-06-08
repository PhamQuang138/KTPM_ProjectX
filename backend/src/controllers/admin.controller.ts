import {PostStatus} from '@prisma/client';
import {Request, Response} from 'express';
import {z} from 'zod';
import {adminService} from '../services/admin.service';
import {AuthenticatedRequest} from '../middlewares/auth';

export const updatePostStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export const updateUserVerificationSchema = z.object({
  isVerifiedProfessional: z.boolean(),
});

export const adminController = {
  async dashboard(_req: Request, res: Response) {
    return res.json({data: await adminService.getDashboard()});
  },

  async listUsers(_req: Request, res: Response) {
    return res.json({data: await adminService.listUsers()});
  },

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({message: 'You cannot delete your own admin account'});
    }

    const targetUser = await adminService.getUserById(req.params.id);
    if (!targetUser) return res.status(404).json({message: 'User not found'});

    if (targetUser.role === 'ADMIN' && (await adminService.countAdmins()) <= 1) {
      return res.status(400).json({message: 'You cannot delete the last admin account'});
    }

    await adminService.deleteUser(req.params.id);
    return res.json({data: {success: true}});
  },

  async updateUserVerification(req: Request, res: Response) {
    const targetUser = await adminService.getUserById(req.params.id);
    if (!targetUser) return res.status(404).json({message: 'User not found'});

    const user = await adminService.updateUserVerification(req.params.id, req.body.isVerifiedProfessional);
    return res.json({data: user});
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
