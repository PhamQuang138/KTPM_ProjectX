"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postDbService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
const notification_service_1 = require("./notification.service");
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
};
exports.postDbService = {
    async getDefaultAuthorId() {
        const user = await prisma_1.prisma.user.findFirst({
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                id: true,
            },
        });
        return user?.id;
    },
    create(input) {
        return prisma_1.prisma.post.create({
            data: {
                title: input.title,
                content: input.content,
                summary: input.summary,
                status: input.status ?? client_1.PostStatus.DRAFT,
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
    async list(input = {}) {
        const posts = await prisma_1.prisma.post.findMany({
            where: {
                ...(input.status ? { status: input.status } : {}),
                ...(input.authorId ? { authorId: input.authorId } : {}),
            },
            include: {
                ...postInclude,
                comments: {
                    include: {
                        user: { select: { id: true, name: true, email: true, avatar: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                _count: { select: { likes: true, comments: true, shares: true } },
                likes: input.viewerId ? { where: { userId: input.viewerId }, select: { id: true } } : false,
                bookmarks: input.viewerId ? { where: { userId: input.viewerId }, select: { id: true } } : false,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: input.limit,
        });
        if (!input.prioritizeTrustedAuthors)
            return posts;
        return posts.sort((left, right) => {
            const leftPriority = left.author.role === 'ADMIN' ? 2 : left.author.isVerifiedProfessional ? 1 : 0;
            const rightPriority = right.author.role === 'ADMIN' ? 2 : right.author.isVerifiedProfessional ? 1 : 0;
            return rightPriority - leftPriority || right.createdAt.getTime() - left.createdAt.getTime();
        });
    },
    listLiked(userId) {
        return prisma_1.prisma.post.findMany({
            where: {
                status: client_1.PostStatus.PUBLISHED,
                likes: {
                    some: { userId },
                },
            },
            include: {
                ...postInclude,
                comments: {
                    include: {
                        user: { select: { id: true, name: true, email: true, avatar: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                _count: { select: { likes: true, comments: true, shares: true } },
                likes: { where: { userId } },
                bookmarks: { where: { userId } },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },
    listBookmarked(userId) {
        return prisma_1.prisma.post.findMany({
            where: { status: client_1.PostStatus.PUBLISHED, bookmarks: { some: { userId } } },
            include: {
                ...postInclude,
                comments: {
                    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
                    orderBy: { createdAt: 'asc' },
                },
                _count: { select: { likes: true, comments: true, shares: true } },
                likes: { where: { userId } },
                bookmarks: { where: { userId } },
            },
            orderBy: { bookmarks: { _count: 'desc' } },
        });
    },
    async getCommunityOverview() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [members, publishedPosts, recentPosts, likes, comments, shares, topMembers] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.post.count({ where: { status: client_1.PostStatus.PUBLISHED } }),
            prisma_1.prisma.post.count({
                where: {
                    status: client_1.PostStatus.PUBLISHED,
                    createdAt: { gte: sevenDaysAgo },
                },
            }),
            prisma_1.prisma.postLike.count({
                where: { post: { status: client_1.PostStatus.PUBLISHED } },
            }),
            prisma_1.prisma.postComment.count({
                where: { post: { status: client_1.PostStatus.PUBLISHED } },
            }),
            prisma_1.prisma.postShare.count({
                where: { post: { status: client_1.PostStatus.PUBLISHED } },
            }),
            prisma_1.prisma.user.findMany({
                where: {
                    posts: { some: { status: client_1.PostStatus.PUBLISHED } },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    _count: {
                        select: {
                            posts: { where: { status: client_1.PostStatus.PUBLISHED } },
                        },
                    },
                },
                orderBy: {
                    posts: { _count: 'desc' },
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
    getById(id) {
        return prisma_1.prisma.post.findUnique({
            where: { id },
            include: postInclude,
        });
    },
    updateCaption(id, content) {
        return prisma_1.prisma.post.update({
            where: { id },
            data: { content },
            select: { id: true, content: true, updatedAt: true },
        });
    },
    delete(id) {
        return prisma_1.prisma.post.delete({ where: { id } });
    },
    async toggleLike(postId, userId) {
        const post = await prisma_1.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true, title: true },
        });
        const existing = await prisma_1.prisma.postLike.findUnique({
            where: { postId_userId: { postId, userId } },
        });
        if (existing) {
            await prisma_1.prisma.postLike.delete({ where: { id: existing.id } });
        }
        else {
            await prisma_1.prisma.postLike.create({ data: { postId, userId } });
            if (post) {
                await notification_service_1.notificationService.create({
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
            count: await prisma_1.prisma.postLike.count({ where: { postId } }),
        };
    },
    async addComment(postId, userId, content) {
        const comment = await prisma_1.prisma.postComment.create({
            data: { postId, userId, content },
            include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
            },
        });
        const count = await prisma_1.prisma.postComment.count({ where: { postId } });
        const post = await prisma_1.prisma.post.findUnique({ where: { id: postId }, select: { authorId: true, title: true } });
        if (post) {
            await notification_service_1.notificationService.create({
                recipientId: post.authorId,
                actorId: userId,
                type: 'comment',
                title: 'Bình luận mới',
                message: `Đã bình luận bài viết "${post.title}"`,
                link: `/feed#post-${postId}`,
            });
        }
        return { comment, count };
    },
    async toggleBookmark(postId, userId) {
        const existing = await prisma_1.prisma.postBookmark.findUnique({
            where: { postId_userId: { postId, userId } },
        });
        if (existing) {
            await prisma_1.prisma.postBookmark.delete({ where: { id: existing.id } });
        }
        else {
            await prisma_1.prisma.postBookmark.create({ data: { postId, userId } });
        }
        return { bookmarked: !existing };
    },
    async addShare(postId, userId) {
        await prisma_1.prisma.postShare.create({ data: { postId, userId } });
        return { count: await prisma_1.prisma.postShare.count({ where: { postId } }) };
    },
};
//# sourceMappingURL=postDb.service.js.map