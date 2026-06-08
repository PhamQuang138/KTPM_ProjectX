import {PostStatus, Prisma} from '@prisma/client';
import {prisma} from '../config/prisma';

export interface CreatePostImageInput {
  url: string;
  publicId?: string;
  caption?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  summary?: string;
  status?: PostStatus;
  authorId: string;
  images?: CreatePostImageInput[];
}

export interface ListPostInput {
  status?: PostStatus;
  authorId?: string;
  viewerId?: string;
}

const postInclude = {
  author: {
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
    },
  },
  images: {
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.PostInclude;

export const postDbService = {
  async getDefaultAuthorId() {
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
      },
    });

    return user?.id;
  },

  create(input: CreatePostInput) {
    return prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        summary: input.summary,
        status: input.status ?? PostStatus.DRAFT,
        authorId: input.authorId,
        images: input.images?.length
          ? {
              create: input.images.map((image) => ({
                url: image.url,
                publicId: image.publicId,
                caption: image.caption,
              })),
            }
          : undefined,
      },
      include: postInclude,
    });
  },

  list(input: ListPostInput = {}) {
    return prisma.post.findMany({
      where: {
        ...(input.status ? {status: input.status} : {}),
        ...(input.authorId ? {authorId: input.authorId} : {}),
      },
      include: {
        ...postInclude,
        comments: {
          include: {
            user: {select: {id: true, name: true, email: true, avatar: true}},
          },
          orderBy: {createdAt: 'asc'},
        },
        _count: {select: {likes: true, comments: true, shares: true}},
        likes: input.viewerId ? {where: {userId: input.viewerId}, select: {id: true}} : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  getById(id: string) {
    return prisma.post.findUnique({
      where: {id},
      include: postInclude,
    });
  },

  async toggleLike(postId: string, userId: string) {
    const existing = await prisma.postLike.findUnique({
      where: {postId_userId: {postId, userId}},
    });

    if (existing) {
      await prisma.postLike.delete({where: {id: existing.id}});
    } else {
      await prisma.postLike.create({data: {postId, userId}});
    }

    return {
      liked: !existing,
      count: await prisma.postLike.count({where: {postId}}),
    };
  },

  async addComment(postId: string, userId: string, content: string) {
    const comment = await prisma.postComment.create({
      data: {postId, userId, content},
      include: {
        user: {select: {id: true, name: true, email: true, avatar: true}},
      },
    });
    const count = await prisma.postComment.count({where: {postId}});
    return {comment, count};
  },

  async addShare(postId: string, userId: string) {
    await prisma.postShare.create({data: {postId, userId}});
    return {count: await prisma.postShare.count({where: {postId}})};
  },
};
