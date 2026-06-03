import {Request, Response} from 'express';
import {z} from 'zod';
import {PostStatus} from '@prisma/client';
import {postDbService} from '../services/postDb.service';

export const createPostSchema = z.object({
  title: z.string().min(1).max(180),
  content: z.string().min(1).max(20000),
  summary: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  authorId: z.string().uuid(),
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
  authorId: z.string().uuid().optional(),
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

export const postController = {
  async list(req: Request, res: Response) {
    const status = req.query.status?.toString() as PostStatus | undefined;
    const posts = await postDbService.list({
      status,
      authorId: req.query.authorId?.toString(),
    });
    return res.json({data: posts});
  },

  async listCommunity(req: Request, res: Response) {
    const posts = await postDbService.list({
      status: PostStatus.PUBLISHED,
      authorId: req.query.authorId?.toString(),
    });

    return res.json({
      data: posts.map((post) => ({
        id: post.id,
        author: {
          name: post.author.name,
          handle: post.author.email.split('@')[0],
          avatar: post.author.avatar ?? `https://i.pravatar.cc/200?u=${encodeURIComponent(post.author.email)}`,
          isVerified: true,
          isProUser: false,
        },
        content: post.content,
        image: post.images[0]?.url,
        images: post.images.map((image) => image.url),
        type: 'story',
        timestamp: new Intl.RelativeTimeFormat('en', {numeric: 'auto'}).format(
          Math.round((post.createdAt.getTime() - Date.now()) / 86400000),
          'day',
        ),
        likes: 0,
        comments: 0,
        shares: 0,
        category: post.status === PostStatus.PUBLISHED ? 'Published' : 'Draft',
        tags: [],
      })),
    });
  },

  async getById(req: Request, res: Response) {
    const post = await postDbService.getById(req.params.id);
    if (!post) {
      return res.status(404).json({message: 'Post not found'});
    }

    return res.json({data: post});
  },

  async create(req: Request, res: Response) {
    const post = await postDbService.create(req.body);
    return res.status(201).json({data: post});
  },

  async createLegacyCommunityPost(req: Request, res: Response) {
    const normalizedImages = req.body.images?.map((image: string | {url: string; publicId?: string; caption?: string}) =>
      typeof image === 'string' ? {url: image} : image,
    );
    const authorId = req.body.authorId ?? (await postDbService.getDefaultAuthorId());

    if (!authorId) {
      return res.status(400).json({message: 'No author found. Run the database seed script first.'});
    }

    const post = await postDbService.create({
      title: req.body.title ?? req.body.content.slice(0, 80),
      content: req.body.content,
      summary: req.body.summary,
      status: req.body.status,
      authorId,
      images: normalizedImages,
    });

    return res.status(201).json({
      data: {
        id: post.id,
        author: {
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
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        category: 'Community',
        tags: [],
      },
    });
  },
};
