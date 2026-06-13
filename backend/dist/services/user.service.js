"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_1 = require("../config/prisma");
const notification_service_1 = require("./notification.service");
const getRating = async (targetUserId, viewerId) => {
    const [targetUser, aggregate, myRating] = await Promise.all([
        prisma_1.prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true },
        }),
        prisma_1.prisma.userRating.aggregate({
            where: { targetUserId },
            _avg: { score: true },
            _count: { score: true },
        }),
        viewerId
            ? prisma_1.prisma.userRating.findUnique({
                where: { raterId_targetUserId: { raterId: viewerId, targetUserId } },
                select: { score: true },
            })
            : Promise.resolve(null),
    ]);
    if (!targetUser)
        return undefined;
    return {
        averageRating: aggregate._avg.score ?? 0,
        totalRatings: aggregate._count.score,
        myRating: myRating?.score ?? null,
    };
};
exports.userService = {
    getOwnSettings(userId) {
        return prisma_1.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: {
                themePreference: true,
                displayDensity: true,
                fontScale: true,
                autoOpenChatbot: true,
                notifySocial: true,
                notifyMarketplace: true,
                notifyMessages: true,
            },
        });
    },
    updateOwnSettings(userId, input) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: input,
            select: {
                themePreference: true,
                displayDensity: true,
                fontScale: true,
                autoOpenChatbot: true,
                notifySocial: true,
                notifyMarketplace: true,
                notifyMessages: true,
            },
        });
    },
    getFollowSuggestions(viewerId) {
        return prisma_1.prisma.user.findMany({
            where: {
                id: { not: viewerId },
                followers: { none: { followerId: viewerId } },
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                isVerifiedProfessional: true,
                _count: { select: { followers: true, posts: true } },
            },
            orderBy: [
                { role: 'desc' },
                { isVerifiedProfessional: 'desc' },
                { posts: { _count: 'desc' } },
            ],
            take: 5,
        });
    },
    searchUsers(query, viewerId) {
        const search = query.trim();
        if (search.length < 2)
            return Promise.resolve([]);
        return prisma_1.prisma.user.findMany({
            where: {
                id: { not: viewerId },
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                isVerifiedProfessional: true,
            },
            orderBy: [
                { role: 'desc' },
                { isVerifiedProfessional: 'desc' },
                { name: 'asc' },
            ],
            take: 8,
        });
    },
    async getPublicProfile(userId, viewerId) {
        const [user, rating, followersCount, followingCount, isFollowing] = await Promise.all([
            prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    bannerImage: true,
                    bio: true,
                    location: true,
                    focusBrands: true,
                    isVerifiedProfessional: true,
                    role: true,
                    createdAt: true,
                    garageVehicles: {
                        orderBy: { createdAt: 'desc' },
                        take: 6,
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            image: true,
                            condition: true,
                            status: true,
                            specs: true,
                        },
                    },
                    vehicleListings: {
                        where: { status: { not: 'Hidden' } },
                        orderBy: { createdAt: 'desc' },
                        take: 6,
                        include: {
                            vehicle: true,
                        },
                    },
                    _count: {
                        select: {
                            posts: true,
                            garageVehicles: true,
                            vehicleListings: true,
                        },
                    },
                },
            }),
            getRating(userId, viewerId),
            prisma_1.prisma.userFollow.count({ where: { followingId: userId } }),
            prisma_1.prisma.userFollow.count({ where: { followerId: userId } }),
            viewerId
                ? prisma_1.prisma.userFollow.findUnique({
                    where: { followerId_followingId: { followerId: viewerId, followingId: userId } },
                    select: { id: true },
                })
                : Promise.resolve(null),
        ]);
        if (!user)
            return undefined;
        return {
            ...user,
            rating,
            social: {
                followers: followersCount,
                following: followingCount,
                posts: user._count.posts,
                isFollowing: Boolean(isFollowing),
            },
        };
    },
    async followUser(targetUserId, followerId) {
        const targetUser = await prisma_1.prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true },
        });
        if (!targetUser)
            return undefined;
        await prisma_1.prisma.userFollow.upsert({
            where: { followerId_followingId: { followerId, followingId: targetUserId } },
            update: {},
            create: { followerId, followingId: targetUserId },
        });
        await notification_service_1.notificationService.create({
            recipientId: targetUserId,
            actorId: followerId,
            type: 'follow',
            title: 'Người theo dõi mới',
            message: 'Đã bắt đầu theo dõi bạn',
            link: `/profile/${followerId}`,
        });
        const [followers, following] = await Promise.all([
            prisma_1.prisma.userFollow.count({ where: { followingId: targetUserId } }),
            prisma_1.prisma.userFollow.count({ where: { followerId: targetUserId } }),
        ]);
        return { followers, following, isFollowing: true };
    },
    async unfollowUser(targetUserId, followerId) {
        const targetUser = await prisma_1.prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true },
        });
        if (!targetUser)
            return undefined;
        await prisma_1.prisma.userFollow.deleteMany({
            where: { followerId, followingId: targetUserId },
        });
        const [followers, following] = await Promise.all([
            prisma_1.prisma.userFollow.count({ where: { followingId: targetUserId } }),
            prisma_1.prisma.userFollow.count({ where: { followerId: targetUserId } }),
        ]);
        return { followers, following, isFollowing: false };
    },
    updateOwnProfile(userId, input) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                avatar: input.avatar === undefined ? undefined : input.avatar?.trim() || null,
                bannerImage: input.bannerImage === undefined ? undefined : input.bannerImage?.trim() || null,
                bio: input.bio === undefined ? undefined : input.bio?.trim() || null,
                location: input.location === undefined ? undefined : input.location?.trim() || null,
                focusBrands: input.focusBrands === undefined ? undefined : input.focusBrands,
            },
            select: {
                id: true,
                avatar: true,
                bannerImage: true,
                bio: true,
                location: true,
                focusBrands: true,
            },
        });
    },
    async getRating(targetUserId, viewerId) {
        return getRating(targetUserId, viewerId);
    },
    async rateUser(targetUserId, raterId, score) {
        const targetUser = await prisma_1.prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true },
        });
        if (!targetUser)
            return undefined;
        await prisma_1.prisma.userRating.upsert({
            where: { raterId_targetUserId: { raterId, targetUserId } },
            update: { score },
            create: { raterId, targetUserId, score },
        });
        return getRating(targetUserId, raterId);
    },
};
//# sourceMappingURL=user.service.js.map