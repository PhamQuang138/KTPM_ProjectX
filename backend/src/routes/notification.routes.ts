import {Router} from 'express';
import {notificationController} from '../controllers/notification.controller';
import {requireAuth} from '../middlewares/auth';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get('/', notificationController.list);
notificationRouter.post('/read-all', notificationController.markAllRead);
