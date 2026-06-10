import {Router} from 'express';
import {articleRouter} from './article.routes';
import {adminRouter} from './admin.routes';
import {authRouter} from './auth.routes';
import {garageRouter} from './garage.routes';
import {postRouter} from './post.routes';
import {uploadRouter} from './upload.routes';
import {userRouter} from './user.routes';
import {vehicleRouter} from './vehicle.routes';
import {messageRouter} from './message.routes';
import {notificationRouter} from './notification.routes';
import {aiRouter} from './ai.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/uploads', uploadRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/vehicles', vehicleRouter);
apiRouter.use('/garage', garageRouter);
apiRouter.use('/articles', articleRouter);
apiRouter.use('/messages', messageRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/ai', aiRouter);
