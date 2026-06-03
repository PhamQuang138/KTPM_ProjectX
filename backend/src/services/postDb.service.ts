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
      include: postInclude,
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
};
