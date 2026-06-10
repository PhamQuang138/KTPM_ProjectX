import {ArticleStatus, PostStatus} from '@prisma/client';
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

export const updateResourceStatusSchema = z.object({
  status: z.string().trim().min(1).max(80),
});

export const updateArticleStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED']),
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
    return res.json({data: await adminService.listVehicleListings()});
  },

  async updateVehicleStatus(req: Request, res: Response) {
    return res.json({data: await adminService.updateVehicleListingStatus(req.params.id, req.body.status)});
  },

  async deleteVehicle(req: Request, res: Response) {
    await adminService.deleteVehicle(req.params.id);
    return res.json({data: {success: true}});
  },

  async listGarageVehicles(_req: Request, res: Response) {
    return res.json({data: await adminService.listGarageVehicles()});
  },

  async updateGarageVehicleStatus(req: Request, res: Response) {
    return res.json({data: await adminService.updateGarageVehicleStatus(req.params.id, req.body.status)});
  },

  async deleteGarageVehicle(req: Request, res: Response) {
    await adminService.deleteGarageVehicle(req.params.id);
    return res.json({data: {success: true}});
  },

  async listArticles(_req: Request, res: Response) {
    return res.json({data: await adminService.listArticles()});
  },

  async updateArticleStatus(req: Request, res: Response) {
    const article = await adminService.updateArticleStatus(req.params.id, req.body.status as ArticleStatus);
    return res.json({data: article});
  },

  async deleteArticle(req: Request, res: Response) {
    await adminService.deleteArticle(req.params.id);
    return res.json({data: {success: true}});
  },

  async listComments(_req: Request, res: Response) {
    return res.json({data: await adminService.listComments()});
  },

  async deleteComment(req: Request, res: Response) {
    await adminService.deleteComment(req.params.id);
    return res.json({data: {success: true}});
  },

  async listRatings(_req: Request, res: Response) {
    return res.json({data: await adminService.listRatings()});
  },

  async deleteRating(req: Request, res: Response) {
    await adminService.deleteRating(req.params.id);
    return res.json({data: {success: true}});
  },

  async listFollows(_req: Request, res: Response) {
    return res.json({data: await adminService.listFollows()});
  },

  async deleteFollow(req: Request, res: Response) {
    await adminService.deleteFollow(req.params.id);
    return res.json({data: {success: true}});
  },
};
