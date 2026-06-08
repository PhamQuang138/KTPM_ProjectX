import {Router} from 'express';
import {adminController, updatePostStatusSchema, updateUserVerificationSchema} from '../controllers/admin.controller';
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
adminRouter.delete('/vehicles/:id', adminController.deleteVehicle);
