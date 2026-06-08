import {Router} from 'express';
import {
  adminController,
  updateArticleStatusSchema,
  updatePostStatusSchema,
  updateResourceStatusSchema,
  updateUserVerificationSchema,
} from '../controllers/admin.controller';
import {requireAdmin, requireAuth} from '../middlewares/auth';
import {validateBody} from '../middlewares/validateRequest';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/dashboard', adminController.dashboard);
adminRouter.get('/users', adminController.listUsers);
adminRouter.patch('/users/:id/verification', validateBody(updateUserVerificationSchema), adminController.updateUserVerification);
adminRouter.delete('/users/:id', adminController.deleteUser);

adminRouter.get('/posts', adminController.listPosts);
adminRouter.patch('/posts/:id/status', validateBody(updatePostStatusSchema), adminController.updatePostStatus);
adminRouter.delete('/posts/:id', adminController.deletePost);

adminRouter.get('/vehicles', adminController.listVehicles);
adminRouter.patch('/vehicles/:id/status', validateBody(updateResourceStatusSchema), adminController.updateVehicleStatus);
adminRouter.delete('/vehicles/:id', adminController.deleteVehicle);

adminRouter.get('/garage-vehicles', adminController.listGarageVehicles);
adminRouter.patch('/garage-vehicles/:id/status', validateBody(updateResourceStatusSchema), adminController.updateGarageVehicleStatus);
adminRouter.delete('/garage-vehicles/:id', adminController.deleteGarageVehicle);

adminRouter.get('/articles', adminController.listArticles);
adminRouter.patch('/articles/:id/status', validateBody(updateArticleStatusSchema), adminController.updateArticleStatus);
adminRouter.delete('/articles/:id', adminController.deleteArticle);

adminRouter.get('/comments', adminController.listComments);
adminRouter.delete('/comments/:id', adminController.deleteComment);

adminRouter.get('/ratings', adminController.listRatings);
adminRouter.delete('/ratings/:id', adminController.deleteRating);

adminRouter.get('/follows', adminController.listFollows);
adminRouter.delete('/follows/:id', adminController.deleteFollow);
