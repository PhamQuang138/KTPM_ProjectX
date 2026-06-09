import {PostStatus, Prisma} from '@prisma/client';
import {prisma} from '../config/prisma';
import {notificationService} from './notification.service';

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
  prioritizeTrustedAuthors?: boolean;
}

const postInclude = {
  author: {
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      isVerifiedProfessional: true,
      role: true,
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

  async list(input: ListPostInput = {}) {
    const posts = await prisma.post.findMany({
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
        bookmarks: input.viewerId ? {where: {userId: input.viewerId}, select: {id: true}} : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (!input.prioritizeTrustedAuthors) return posts;
    return posts.sort((left, right) => {
      const leftPriority = left.author.role === 'ADMIN' ? 2 : left.author.isVerifiedProfessional ? 1 : 0;
      const rightPriority = right.author.role === 'ADMIN' ? 2 : right.author.isVerifiedProfessional ? 1 : 0;
      return rightPriority - leftPriority || right.createdAt.getTime() - left.createdAt.getTime();
    });
  },

  listLiked(userId: string) {
    return prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        likes: {
          some: {userId},
        },
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
        likes: {where: {userId}},
        bookmarks: {where: {userId}},
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  listBookmarked(userId: string) {
    return prisma.post.findMany({
      where: {status: PostStatus.PUBLISHED, bookmarks: {some: {userId}}},
      include: {
        ...postInclude,
        comments: {
          include: {user: {select: {id: true, name: true, email: true, avatar: true}}},
          orderBy: {createdAt: 'asc'},
        },
        _count: {select: {likes: true, comments: true, shares: true}},
        likes: {where: {userId}},
        bookmarks: {where: {userId}},
      },
      orderBy: {bookmarks: {_count: 'desc'}},
    });
  },

  async getCommunityOverview() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [members, publishedPosts, recentPosts, likes, comments, shares, topMembers] = await Promise.all([
      prisma.user.count(),
      prisma.post.count({where: {status: PostStatus.PUBLISHED}}),
      prisma.post.count({
        where: {
          status: PostStatus.PUBLISHED,
          createdAt: {gte: sevenDaysAgo},
        },
      }),
      prisma.postLike.count({
        where: {post: {status: PostStatus.PUBLISHED}},
      }),
      prisma.postComment.count({
        where: {post: {status: PostStatus.PUBLISHED}},
      }),
      prisma.postShare.count({
        where: {post: {status: PostStatus.PUBLISHED}},
      }),
      prisma.user.findMany({
        where: {
          posts: {some: {status: PostStatus.PUBLISHED}},
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          _count: {
            select: {
              posts: {where: {status: PostStatus.PUBLISHED}},
            },
          },
        },
        orderBy: {
          posts: {_count: 'desc'},
        },
        take: 5,
      }),
    ]);

    return {
      stats: {
        members,
        publishedPosts,
        recentPosts,
        interactions: likes + comments + shares,
      },
      topMembers: topMembers.map((member) => ({
        id: member.id,
        name: member.name,
        handle: member.email.split('@')[0],
        avatar: member.avatar,
        postCount: member._count.posts,
      })),
    };
  },

  getById(id: string) {
    return prisma.post.findUnique({
      where: {id},
      include: postInclude,
    });
  },

  async toggleLike(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: {id: postId},
      select: {authorId: true, title: true},
    });
    const existing = await prisma.postLike.findUnique({
      where: {postId_userId: {postId, userId}},
    });

    if (existing) {
      await prisma.postLike.delete({where: {id: existing.id}});
    } else {
      await prisma.postLike.create({data: {postId, userId}});
      if (post) {
        await notificationService.create({
          recipientId: post.authorId,
          actorId: userId,
          type: 'like',
          title: 'Lượt thích mới',
          message: `Đã thích bài viết "${post.title}"`,
          link: `/feed#post-${postId}`,
        });
      }
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
    const post = await prisma.post.findUnique({where: {id: postId}, select: {authorId: true, title: true}});
    if (post) {
      await notificationService.create({
        recipientId: post.authorId,
        actorId: userId,
        type: 'comment',
        title: 'Bình luận mới',
        message: `Đã bình luận bài viết "${post.title}"`,
        link: `/feed#post-${postId}`,
      });
    }
    return {comment, count};
  },

  async toggleBookmark(postId: string, userId: string) {
    const existing = await prisma.postBookmark.findUnique({
      where: {postId_userId: {postId, userId}},
    });
    if (existing) {
      await prisma.postBookmark.delete({where: {id: existing.id}});
    } else {
      await prisma.postBookmark.create({data: {postId, userId}});
    }
    return {bookmarked: !existing};
  },

  async addShare(postId: string, userId: string) {
    await prisma.postShare.create({data: {postId, userId}});
    return {count: await prisma.postShare.count({where: {postId}})};
  },
};
