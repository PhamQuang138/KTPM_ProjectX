import {Router} from 'express';
import {articleRouter} from './article.routes';
import {adminRouter} from './admin.routes';
import {authRouter} from './auth.routes';
import {garageRouter} from './garage.routes';
import {postRouter} from './post.routes';
import {userRouter} from './user.routes';
import {vehicleRouter} from './vehicle.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/vehicles', vehicleRouter);
apiRouter.use('/garage', garageRouter);
apiRouter.use('/articles', articleRouter);
