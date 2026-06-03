import {Router} from 'express';
import {createPostSchema, legacyCreatePostSchema, postController} from '../controllers/post.controller';
import {validateBody} from '../middlewares/validateRequest';

export const postRouter = Router();

postRouter.get('/', postController.list);
postRouter.get('/community', postController.listCommunity);
postRouter.get('/:id', postController.getById);
postRouter.post('/', validateBody(createPostSchema), postController.create);
postRouter.post('/community', validateBody(legacyCreatePostSchema), postController.createLegacyCommunityPost);
