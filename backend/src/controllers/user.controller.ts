import {Response} from 'express';
import {z} from 'zod';
import {AuthenticatedRequest} from '../middlewares/auth';
import {userService} from '../services/user.service';

export const rateUserSchema = z.object({
  score: z.number().int().min(1).max(5),
});

export const updateProfileSchema = z.object({
  avatar: z.string().url().max(2048).nullable().optional(),
  bannerImage: z.string().url().max(2048).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  focusBrands: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
});

export const userController = {
  async getPublicProfile(req: AuthenticatedRequest, res: Response) {
    const profile = await userService.getPublicProfile(req.params.id, req.user?.id);
    if (!profile) return res.status(404).json({message: 'User not found'});

    return res.json({data: profile});
  },

  async getRating(req: AuthenticatedRequest, res: Response) {
    const rating = await userService.getRating(req.params.id, req.user?.id);
    if (!rating) return res.status(404).json({message: 'User not found'});

    return res.json({data: rating});
  },

  async updateOwnProfile(req: AuthenticatedRequest, res: Response) {
    const profile = await userService.updateOwnProfile(req.user!.id, req.body);
    return res.json({data: profile});
  },

  async rateUser(req: AuthenticatedRequest, res: Response) {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({message: 'You cannot rate yourself'});
    }

    const rating = await userService.rateUser(req.params.id, req.user!.id, req.body.score);
    if (!rating) return res.status(404).json({message: 'User not found'});

    return res.json({data: rating});
  },

  async followUser(req: AuthenticatedRequest, res: Response) {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({message: 'You cannot follow yourself'});
    }

    const result = await userService.followUser(req.params.id, req.user!.id);
    if (!result) return res.status(404).json({message: 'User not found'});

    return res.json({data: result});
  },

  async unfollowUser(req: AuthenticatedRequest, res: Response) {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({message: 'You cannot unfollow yourself'});
    }

    const result = await userService.unfollowUser(req.params.id, req.user!.id);
    if (!result) return res.status(404).json({message: 'User not found'});

    return res.json({data: result});
  },
};
