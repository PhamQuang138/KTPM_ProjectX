import {Request, Response} from 'express';
import {z} from 'zod';
import {PostStatus} from '@prisma/client';
import {postDbService} from '../services/postDb.service';
import {AuthenticatedRequest} from '../middlewares/auth';

export const createPostSchema = z.object({
  title: z.string().min(1).max(180),
  content: z.string().min(1).max(20000),
  summary: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().min(1).max(255).optional(),
        caption: z.string().max(500).optional(),
      }),
    )
    .max(12)
    .optional(),
});

export const listPostQuerySchema = z
  .object({
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    authorId: z.string().uuid().optional(),
  })
  .optional();

export const legacyCreatePostSchema = z.object({
  content: z.string().min(1).max(5000),
  title: z.string().min(1).max(180).optional(),
  summary: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  images: z
    .array(
      z.union(
        [
          z.string().url(),
          z.object({
            url: z.string().url(),
            publicId: z.string().min(1).max(255).optional(),
            caption: z.string().max(500).optional(),
          }),
        ],
      ),
    )
    .max(12)
    .optional(),
  marketplaceListing: z
    .object({
      title: z.string().min(1),
      price: z.string().min(1),
      image: z.string().url(),
    })
    .optional(),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
});

const mapCommunityPost = (post: Awaited<ReturnType<typeof postDbService.list>>[number]) => ({
  id: post.id,
  author: {
    id: post.author.id,
    name: post.author.name,
    handle: post.author.email.split('@')[0],
    avatar: post.author.avatar ?? `https://i.pravatar.cc/200?u=${encodeURIComponent(post.author.email)}`,
    isVerified: post.author.isVerifiedProfessional,
    isProUser: post.author.isVerifiedProfessional,
  },
  content: post.content,
  image: post.images[0]?.url,
  images: post.images.map((image) => image.url),
  type: 'story',
  timestamp: new Intl.RelativeTimeFormat('vi', {numeric: 'auto'}).format(
    Math.round((post.createdAt.getTime() - Date.now()) / 86400000),
    'day',
  ),
  likes: post._count.likes,
  comments: post._count.comments,
  shares: post._count.shares,
  isLikedInitial: post.likes.length > 0,
  isBookmarkedInitial: post.bookmarks.length > 0,
  commentItems: post.comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: comment.user.id,
      name: comment.user.name,
      handle: comment.user.email.split('@')[0],
      avatar:
        comment.user.avatar ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(comment.user.email)}`,
    },
  })),
  category: post.status === PostStatus.PUBLISHED ? 'Đã đăng' : 'Bản nháp',
  tags: [],
});

export const postController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const status = req.query.status?.toString() as PostStatus | undefined;
    const authorId = req.query.authorId?.toString();
    const canViewDrafts = req.user?.role === 'ADMIN' || (authorId && req.user?.id === authorId);
    const posts = await postDbService.list({
      status: canViewDrafts ? status : PostStatus.PUBLISHED,
      authorId,
      viewerId: req.user?.id,
    });
    return res.json({data: posts});
  },

  async listCommunity(req: AuthenticatedRequest, res: Response) {
    const posts = await postDbService.list({
      status: PostStatus.PUBLISHED,
      authorId: req.query.authorId?.toString(),
      viewerId: req.user?.id,
    });

    return res.json({
      data: posts.map(mapCommunityPost),
    });
  },

  async listLiked(req: AuthenticatedRequest, res: Response) {
    const posts = await postDbService.listLiked(req.user!.id);

    return res.json({
      data: posts.map(mapCommunityPost),
    });
  },

  async listBookmarked(req: AuthenticatedRequest, res: Response) {
    const posts = await postDbService.listBookmarked(req.user!.id);
    return res.json({data: posts.map(mapCommunityPost)});
  },

  async communityOverview(_req: Request, res: Response) {
    return res.json({
      data: await postDbService.getCommunityOverview(),
    });
  },

  async getById(req: Request, res: Response) {
    const post = await postDbService.getById(req.params.id);
    if (!post) {
      return res.status(404).json({message: 'Không tìm thấy bài viết'});
    }

    return res.json({data: post});
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const post = await postDbService.create({...req.body, authorId: req.user!.id});
    return res.status(201).json({data: post});
  },

  async createLegacyCommunityPost(req: AuthenticatedRequest, res: Response) {
    const normalizedImages = req.body.images?.map((image: string | {url: string; publicId?: string; caption?: string}) =>
      typeof image === 'string' ? {url: image} : image,
    );
    const post = await postDbService.create({
      title: req.body.title ?? req.body.content.slice(0, 80),
      content: req.body.content,
      summary: req.body.summary,
      status: req.body.status,
      authorId: req.user!.id,
      images: normalizedImages,
    });

    return res.status(201).json({
      data: {
        id: post.id,
        author: {
          id: post.author.id,
          name: post.author.name,
          handle: post.author.email.split('@')[0],
          avatar: post.author.avatar ?? 'https://i.pravatar.cc/200?u=community',
          isVerified: true,
          isProUser: false,
        },
        content: post.content,
        image: post.images[0]?.url,
        images: post.images.map((image) => image.url),
        type: 'story',
        timestamp: 'Vừa xong',
        likes: 0,
        comments: 0,
        shares: 0,
        isLikedInitial: false,
        commentItems: [],
        category: 'Cộng đồng',
        tags: [],
      },
    });
  },

  async toggleLike(req: AuthenticatedRequest, res: Response) {
    const post = await postDbService.getById(req.params.id);
    if (!post) return res.status(404).json({message: 'Không tìm thấy bài viết'});

    return res.json({data: await postDbService.toggleLike(post.id, req.user!.id)});
  },

  async addComment(req: AuthenticatedRequest, res: Response) {
    const post = await postDbService.getById(req.params.id);
    if (!post) return res.status(404).json({message: 'Không tìm thấy bài viết'});

    const result = await postDbService.addComment(post.id, req.user!.id, req.body.content);
    return res.status(201).json({
      data: {
        count: result.count,
        comment: {
          id: result.comment.id,
          content: result.comment.content,
          createdAt: result.comment.createdAt,
          author: {
            id: result.comment.user.id,
            name: result.comment.user.name,
            handle: result.comment.user.email.split('@')[0],
            avatar:
              result.comment.user.avatar ??
              `https://i.pravatar.cc/100?u=${encodeURIComponent(result.comment.user.email)}`,
          },
        },
      },
    });
  },

  async addShare(req: AuthenticatedRequest, res: Response) {
    const post = await postDbService.getById(req.params.id);
    if (!post) return res.status(404).json({message: 'Không tìm thấy bài viết'});

    return res.status(201).json({data: await postDbService.addShare(post.id, req.user!.id)});
  },

  async toggleBookmark(req: AuthenticatedRequest, res: Response) {
    const post = await postDbService.getById(req.params.id);
    if (!post) return res.status(404).json({message: 'Không tìm thấy bài viết'});
    return res.json({data: await postDbService.toggleBookmark(post.id, req.user!.id)});
  },
};
