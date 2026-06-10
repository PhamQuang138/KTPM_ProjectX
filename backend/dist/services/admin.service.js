"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
exports.adminService = {
    async getDashboard() {
        const [users, posts, garageVehicles, vehicleListings, articles, comments, ratings, follows, draftPosts, publishedPosts, draftArticles, publishedArticles,] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.post.count(),
            prisma_1.prisma.garageVehicle.count(),
            prisma_1.prisma.vehicleListing.count(),
            prisma_1.prisma.article.count(),
            prisma_1.prisma.postComment.count(),
            prisma_1.prisma.userRating.count(),
            prisma_1.prisma.userFollow.count(),
            prisma_1.prisma.post.count({ where: { status: client_1.PostStatus.DRAFT } }),
            prisma_1.prisma.post.count({ where: { status: client_1.PostStatus.PUBLISHED } }),
            prisma_1.prisma.article.count({ where: { status: client_1.ArticleStatus.DRAFT } }),
            prisma_1.prisma.article.count({ where: { status: client_1.ArticleStatus.PUBLISHED } }),
        ]);
        return {
            users,
            posts,
            garageVehicles,
            vehicleListings,
            articles,
            comments,
            ratings,
            follows,
            draftPosts,
            publishedPosts,
            draftArticles,
            publishedArticles,
        };
    },
    listUsers() {
        return prisma_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                isVerifiedProfessional: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        garageVehicles: true,
                        vehicleListings: true,
                        postComments: true,
                        postLikes: true,
                        postShares: true,
                        followers: true,
                        following: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    getUserById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            select: { id: true, role: true },
        });
    },
    countAdmins() {
        return prisma_1.prisma.user.count({ where: { role: 'ADMIN' } });
    },
    updateUserVerification(id, isVerifiedProfessional) {
        return prisma_1.prisma.user.update({
            where: { id },
            data: { isVerifiedProfessional },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                isVerifiedProfessional: true,
                createdAt: true,
                _count: {
                    select: { posts: true, garageVehicles: true, vehicleListings: true },
                },
            },
        });
    },
    listPosts() {
        return prisma_1.prisma.post.findMany({
            include: {
                author: { select: { id: true, name: true, email: true, avatar: true } },
                images: true,
                _count: { select: { likes: true, comments: true, shares: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    updatePostStatus(id, status) {
        return prisma_1.prisma.post.update({
            where: { id },
            data: { status },
            include: {
                author: { select: { id: true, name: true, email: true } },
                images: true,
            },
        });
    },
    deletePost(id) {
        return prisma_1.prisma.post.delete({ where: { id } });
    },
    listVehicleListings() {
        return prisma_1.prisma.vehicleListing.findMany({
            include: {
                seller: { select: { id: true, name: true, email: true, avatar: true } },
                vehicle: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    deleteVehicle(id) {
        return prisma_1.prisma.vehicleListing.delete({ where: { id } });
    },
    updateVehicleListingStatus(id, status) {
        return prisma_1.prisma.vehicleListing.update({
            where: { id },
            data: { status },
            include: {
                seller: { select: { id: true, name: true, email: true, avatar: true } },
                vehicle: true,
            },
        });
    },
    listGarageVehicles() {
        return prisma_1.prisma.garageVehicle.findMany({
            include: {
                owner: { select: { id: true, name: true, email: true, avatar: true } },
                listings: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    updateGarageVehicleStatus(id, status) {
        return prisma_1.prisma.garageVehicle.update({
            where: { id },
            data: { status },
            include: {
                owner: { select: { id: true, name: true, email: true, avatar: true } },
                listings: true,
            },
        });
    },
    deleteGarageVehicle(id) {
        return prisma_1.prisma.garageVehicle.delete({ where: { id } });
    },
    listArticles() {
        return prisma_1.prisma.article.findMany({
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        });
    },
    updateArticleStatus(id, status) {
        return prisma_1.prisma.article.update({
            where: { id },
            data: {
                status,
                publishedAt: status === client_1.ArticleStatus.PUBLISHED ? new Date() : null,
            },
        });
    },
    deleteArticle(id) {
        return prisma_1.prisma.article.delete({ where: { id } });
    },
    listComments() {
        return prisma_1.prisma.postComment.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
                post: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    deleteComment(id) {
        return prisma_1.prisma.postComment.delete({ where: { id } });
    },
    listRatings() {
        return prisma_1.prisma.userRating.findMany({
            include: {
                rater: { select: { id: true, name: true, email: true } },
                targetUser: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    deleteRating(id) {
        return prisma_1.prisma.userRating.delete({ where: { id } });
    },
    listFollows() {
        return prisma_1.prisma.userFollow.findMany({
            include: {
                follower: { select: { id: true, name: true, email: true } },
                following: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    deleteFollow(id) {
        return prisma_1.prisma.userFollow.delete({ where: { id } });
    },
    deleteUser(id) {
        return prisma_1.prisma.user.delete({ where: { id } });
    },
};
//# sourceMappingURL=admin.service.js.map