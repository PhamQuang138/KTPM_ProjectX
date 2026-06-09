import {Router} from 'express';
import {
  createCommentSchema,
  createPostSchema,
  legacyCreatePostSchema,
  postController,
} from '../controllers/post.controller';
import {validateBody} from '../middlewares/validateRequest';
import {optionalAuth, requireAuth} from '../middlewares/auth';

export const postRouter = Router();

postRouter.get('/', optionalAuth, postController.list);
postRouter.get('/community', optionalAuth, postController.listCommunity);
postRouter.get('/community-overview', postController.communityOverview);
postRouter.get('/liked', requireAuth, postController.listLiked);
postRouter.post('/:id/like', requireAuth, postController.toggleLike);
postRouter.post('/:id/comments', requireAuth, validateBody(createCommentSchema), postController.addComment);
postRouter.post('/:id/share', requireAuth, postController.addShare);
postRouter.get('/:id', postController.getById);
postRouter.post('/', requireAuth, validateBody(createPostSchema), postController.create);
postRouter.post('/community', requireAuth, validateBody(legacyCreatePostSchema), postController.createLegacyCommunityPost);
