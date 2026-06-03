import {Router} from 'express';
import {authController, loginSchema, signupSchema} from '../controllers/auth.controller';
import {validateBody} from '../middlewares/validateRequest';

export const authRouter = Router();

authRouter.post('/signup', validateBody(signupSchema), authController.signup);
authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.post('/logout', authController.logout);
