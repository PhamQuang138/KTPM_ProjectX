import {Router} from 'express';
import {rateUserSchema, updateProfileSchema, updateSettingsSchema, userController} from '../controllers/user.controller';
import {optionalAuth, requireAuth} from '../middlewares/auth';
import {validateBody} from '../middlewares/validateRequest';

export const userRouter = Router();

userRouter.patch('/me/profile', requireAuth, validateBody(updateProfileSchema), userController.updateOwnProfile);
userRouter.get('/me/settings', requireAuth, userController.getOwnSettings);
userRouter.patch('/me/settings', requireAuth, validateBody(updateSettingsSchema), userController.updateOwnSettings);
userRouter.get('/search/accounts', requireAuth, userController.searchUsers);
userRouter.get('/suggestions/follow', requireAuth, userController.getFollowSuggestions);
userRouter.get('/:id', optionalAuth, userController.getPublicProfile);
userRouter.get('/:id/rating', optionalAuth, userController.getRating);
userRouter.post('/:id/follow', requireAuth, userController.followUser);
userRouter.delete('/:id/follow', requireAuth, userController.unfollowUser);
userRouter.post('/:id/rating', requireAuth, validateBody(rateUserSchema), userController.rateUser);
