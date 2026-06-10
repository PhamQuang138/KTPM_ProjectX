"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postController = exports.updatePostCaptionSchema = exports.createCommentSchema = exports.legacyCreatePostSchema = exports.listPostQuerySchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const postDb_service_1 = require("../services/postDb.service");
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(180),
    content: zod_1.z.string().min(1).max(20000),
    summary: zod_1.z.string().max(500).optional(),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED']).optional(),
    images: zod_1.z
        .array(zod_1.z.object({
        url: zod_1.z.string().url(),
        publicId: zod_1.z.string().min(1).max(255).optional(),
        caption: zod_1.z.string().max(500).optional(),
    }))
        .max(12)
        .optional(),
});
exports.listPostQuerySchema = zod_1.z
    .object({
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED']).optional(),
    authorId: zod_1.z.string().uuid().optional(),
})
    .optional();
exports.legacyCreatePostSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(5000),
    title: zod_1.z.string().min(1).max(180).optional(),
    summary: zod_1.z.string().max(500).optional(),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED']).optional(),
    images: zod_1.z
        .array(zod_1.z.union([
        zod_1.z.string().url(),
        zod_1.z.object({
            url: zod_1.z.string().url(),
            publicId: zod_1.z.string().min(1).max(255).optional(),
            caption: zod_1.z.string().max(500).optional(),
        }),
    ]))
        .max(12)
        .optional(),
    marketplaceListing: zod_1.z
        .object({
        title: zod_1.z.string().min(1),
        price: zod_1.z.string().min(1),
        image: zod_1.z.string().url(),
    })
        .optional(),
});
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().trim().min(1, 'Comment cannot be empty').max(2000),
});
exports.updatePostCaptionSchema = zod_1.z.object({
    content: zod_1.z.string().trim().min(1, 'Nội dung không được để trống').max(5000),
});
const mapCommunityPost = (post) => ({
    id: post.id,
    author: {
        id: post.author.id,
        name: post.author.name,
        handle: post.author.email.split('@')[0],
        avatar: post.author.avatar ?? `https://i.pravatar.cc/200?u=${encodeURIComponent(post.author.email)}`,
        isVerified: post.author.isVerifiedProfessional || post.author.role === 'ADMIN',
        isProUser: post.author.isVerifiedProfessional || post.author.role === 'ADMIN',
        role: post.author.role,
    },
    content: post.content,
    image: post.images[0]?.url,
    images: post.images.map((image) => image.url),
    type: 'story',
    timestamp: new Intl.RelativeTimeFormat('vi', { numeric: 'auto' }).format(Math.round((post.createdAt.getTime() - Date.now()) / 86400000), 'day'),
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
            avatar: comment.user.avatar ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(comment.user.email)}`,
        },
    })),
    category: post.status === client_1.PostStatus.PUBLISHED ? 'Đã đăng' : 'Bản nháp',
    tags: [],
});
exports.postController = {
    async list(req, res) {
        const status = req.query.status?.toString();
        const authorId = req.query.authorId?.toString();
        const canViewDrafts = req.user?.role === 'ADMIN' || (authorId && req.user?.id === authorId);
        const posts = await postDb_service_1.postDbService.list({
            status: canViewDrafts ? status : client_1.PostStatus.PUBLISHED,
            authorId,
            viewerId: req.user?.id,
        });
        return res.json({ data: posts });
    },
    async listCommunity(req, res) {
        const posts = await postDb_service_1.postDbService.list({
            status: client_1.PostStatus.PUBLISHED,
            authorId: req.query.authorId?.toString(),
            viewerId: req.user?.id,
            prioritizeTrustedAuthors: !req.query.authorId,
        });
        return res.json({
            data: posts.map(mapCommunityPost),
        });
    },
    async listLiked(req, res) {
        const posts = await postDb_service_1.postDbService.listLiked(req.user.id);
        return res.json({
            data: posts.map(mapCommunityPost),
        });
    },
    async listBookmarked(req, res) {
        const posts = await postDb_service_1.postDbService.listBookmarked(req.user.id);
        return res.json({ data: posts.map(mapCommunityPost) });
    },
    async communityOverview(_req, res) {
        return res.json({
            data: await postDb_service_1.postDbService.getCommunityOverview(),
        });
    },
    async getById(req, res) {
        const post = await postDb_service_1.postDbService.getById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
        return res.json({ data: post });
    },
    async create(req, res) {
        const post = await postDb_service_1.postDbService.create({ ...req.body, authorId: req.user.id });
        return res.status(201).json({ data: post });
    },
    async createLegacyCommunityPost(req, res) {
        const normalizedImages = req.body.images?.map((image) => typeof image === 'string' ? { url: image } : image);
        const post = await postDb_service_1.postDbService.create({
            title: req.body.title ?? req.body.content.slice(0, 80),
            content: req.body.content,
            summary: req.body.summary,
            status: req.body.status,
            authorId: req.user.id,
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
                    isVerified: post.author.isVerifiedProfessional || post.author.role === 'ADMIN',
                    isProUser: post.author.isVerifiedProfessional || post.author.role === 'ADMIN',
                    role: post.author.role,
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
    async toggleLike(req, res) {
        const post = await postDb_service_1.postDbService.getById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        return res.json({ data: await postDb_service_1.postDbService.toggleLike(post.id, req.user.id) });
    },
    async addComment(req, res) {
        const post = await postDb_service_1.postDbService.getById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        const result = await postDb_service_1.postDbService.addComment(post.id, req.user.id, req.body.content);
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
                        avatar: result.comment.user.avatar ??
                            `https://i.pravatar.cc/100?u=${encodeURIComponent(result.comment.user.email)}`,
                    },
                },
            },
        });
    },
    async addShare(req, res) {
        const post = await postDb_service_1.postDbService.getById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        return res.status(201).json({ data: await postDb_service_1.postDbService.addShare(post.id, req.user.id) });
    },
    async updateCaption(req, res) {
        const post = await postDb_service_1.postDbService.getById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Bạn không có quyền sửa bài viết này' });
        }
        return res.json({ data: await postDb_service_1.postDbService.updateCaption(post.id, req.body.content) });
    },
    async delete(req, res) {
        const post = await postDb_service_1.postDbService.getById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bài viết này' });
        }
        await postDb_service_1.postDbService.delete(post.id);
        return res.status(204).send();
    },
    async toggleBookmark(req, res) {
        const post = await postDb_service_1.postDbService.getById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        return res.json({ data: await postDb_service_1.postDbService.toggleBookmark(post.id, req.user.id) });
    },
};
//# sourceMappingURL=post.controller.js.map