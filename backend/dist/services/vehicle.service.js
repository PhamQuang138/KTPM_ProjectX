"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleService = void 0;
const vehicleImages_1 = require("../data/vehicleImages");
const prisma_1 = require("../config/prisma");
const notification_service_1 = require("./notification.service");
const listingInclude = {
    seller: { select: { id: true, name: true, avatar: true, email: true, role: true, isVerifiedProfessional: true } },
    vehicle: true,
    comments: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
    },
    _count: { select: { favorites: true, comments: true } },
};
const garageInclude = {
    owner: { select: { id: true, name: true, avatar: true, email: true } },
    listings: true,
};
exports.vehicleService = {
    listGarageVehicles(ownerId) {
        return prisma_1.prisma.garageVehicle.findMany({
            where: ownerId ? { ownerId } : undefined,
            include: garageInclude,
            orderBy: { createdAt: 'desc' },
        });
    },
    getGarageVehicleById(id) {
        return prisma_1.prisma.garageVehicle.findUnique({ where: { id }, include: garageInclude });
    },
    findActiveListingByGarageVehicleId(vehicleId) {
        return prisma_1.prisma.vehicleListing.findFirst({
            where: {
                vehicleId,
                status: { not: 'Sold' },
            },
            include: listingInclude,
            orderBy: { createdAt: 'desc' },
        });
    },
    createGarageVehicle(input) {
        return prisma_1.prisma.garageVehicle.create({
            data: {
                title: input.title,
                description: input.description,
                image: input.image,
                images: input.images ?? [input.image],
                condition: input.condition ?? 'Used',
                make: input.make,
                model: input.model,
                year: input.year,
                mileage: input.mileage,
                bodyType: input.bodyType,
                fuelType: input.fuelType,
                transmission: input.transmission,
                specs: input.specs ?? [],
                status: input.status ?? 'In Garage',
                ownerId: input.ownerId,
            },
            include: garageInclude,
        });
    },
    updateGarageVehicle(id, input) {
        return prisma_1.prisma.garageVehicle.update({ where: { id }, data: input, include: garageInclude });
    },
    deleteGarageVehicle(id) {
        return prisma_1.prisma.$transaction(async (transaction) => {
            await transaction.vehicleListing.deleteMany({ where: { vehicleId: id } });
            return transaction.garageVehicle.delete({ where: { id } });
        });
    },
    async listListings(input) {
        const vehicleWhere = {
            ...(input.condition ? { condition: input.condition } : {}),
            ...(input.make ? { make: { equals: input.make, mode: 'insensitive' } } : {}),
            ...(input.bodyType ? { bodyType: { equals: input.bodyType, mode: 'insensitive' } } : {}),
            ...(input.fuelType ? { fuelType: { equals: input.fuelType, mode: 'insensitive' } } : {}),
            ...(input.transmission ? { transmission: { equals: input.transmission, mode: 'insensitive' } } : {}),
            ...(input.minYear || input.maxYear
                ? { year: { gte: input.minYear, lte: input.maxYear } }
                : {}),
        };
        const hasVehicleFilter = Object.keys(vehicleWhere).length > 0;
        const where = {
            ...(input.category ? { category: { equals: input.category, mode: 'insensitive' } } : {}),
            ...(input.search
                ? {
                    OR: [
                        { title: { contains: input.search, mode: 'insensitive' } },
                        { description: { contains: input.search, mode: 'insensitive' } },
                        { location: { contains: input.search, mode: 'insensitive' } },
                        { vehicle: { is: { OR: [
                                        { make: { contains: input.search, mode: 'insensitive' } },
                                        { model: { contains: input.search, mode: 'insensitive' } },
                                    ] } } },
                    ],
                }
                : {}),
            ...(input.sellerId ? { sellerId: input.sellerId } : {}),
            ...(!input.sellerId ? { status: { not: 'Hidden' } } : {}),
            ...(hasVehicleFilter ? { vehicle: { is: vehicleWhere } } : {}),
        };
        const orderBy = input.sort === 'trending'
            ? [{ favorites: { _count: 'desc' } }, { comments: { _count: 'desc' } }, { createdAt: 'desc' }]
            : input.sort === 'oldest'
                ? [{ createdAt: 'asc' }]
                : [{ createdAt: 'desc' }];
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        const [items, total, activeCount, newThisWeek, verifiedSellers, dailyRows] = await Promise.all([
            prisma_1.prisma.vehicleListing.findMany({
                where,
                include: {
                    ...listingInclude,
                    favorites: input.viewerId ? { where: { userId: input.viewerId }, select: { id: true } } : false,
                },
                orderBy,
                skip: (input.page - 1) * input.limit,
                take: input.limit,
            }),
            prisma_1.prisma.vehicleListing.count({ where }),
            prisma_1.prisma.vehicleListing.count({ where: { status: 'Active Listing' } }),
            prisma_1.prisma.vehicleListing.count({ where: { status: 'Active Listing', createdAt: { gte: sevenDaysAgo } } }),
            prisma_1.prisma.user.count({ where: { isVerifiedProfessional: true, vehicleListings: { some: { status: 'Active Listing' } } } }),
            prisma_1.prisma.vehicleListing.findMany({
                where: { status: 'Active Listing', createdAt: { gte: sevenDaysAgo } },
                select: { createdAt: true },
            }),
        ]);
        const daily = Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - (6 - index));
            const key = date.toISOString().slice(0, 10);
            return {
                date: key,
                count: dailyRows.filter((row) => row.createdAt.toISOString().slice(0, 10) === key).length,
            };
        });
        return {
            items: items.map((item) => ({
                ...item,
                isFavorite: Array.isArray(item.favorites) && item.favorites.length > 0,
            })),
            pagination: {
                page: input.page,
                limit: input.limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / input.limit)),
            },
            stats: { activeCount, newThisWeek, verifiedSellers, daily },
        };
    },
    getListingById(id) {
        return prisma_1.prisma.vehicleListing.findUnique({ where: { id }, include: listingInclude });
    },
    createListing(input) {
        return prisma_1.prisma.vehicleListing.create({
            data: {
                title: input.title,
                description: input.description,
                price: input.price,
                location: input.location,
                category: input.category ?? 'Daily',
                status: input.status ?? 'Active Listing',
                sellerId: input.sellerId,
                vehicleId: input.vehicleId,
            },
            include: listingInclude,
        });
    },
    updateListing(id, input) {
        return prisma_1.prisma.vehicleListing.update({ where: { id }, data: input, include: listingInclude });
    },
    deleteListing(id) {
        return prisma_1.prisma.vehicleListing.delete({ where: { id } });
    },
    listVehicleImages() {
        return vehicleImages_1.vehicleImageSeeds;
    },
    async toggleFavorite(listingId, userId) {
        const existing = await prisma_1.prisma.listingFavorite.findUnique({
            where: { listingId_userId: { listingId, userId } },
        });
        if (existing) {
            await prisma_1.prisma.listingFavorite.delete({ where: { id: existing.id } });
        }
        else {
            await prisma_1.prisma.listingFavorite.create({ data: { listingId, userId } });
            const listing = await prisma_1.prisma.vehicleListing.findUnique({
                where: { id: listingId },
                select: { sellerId: true, title: true },
            });
            if (listing) {
                await notification_service_1.notificationService.create({
                    recipientId: listing.sellerId,
                    actorId: userId,
                    type: 'marketplace',
                    title: 'Tin xe được quan tâm',
                    message: `Đã lưu tin "${listing.title}"`,
                    link: `/market/${listingId}`,
                });
            }
        }
        return {
            favorite: !existing,
            count: await prisma_1.prisma.listingFavorite.count({ where: { listingId } }),
        };
    },
    async addComment(listingId, userId, content) {
        const comment = await prisma_1.prisma.listingComment.create({
            data: { listingId, userId, content },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        });
        const listing = await prisma_1.prisma.vehicleListing.findUnique({
            where: { id: listingId },
            select: { sellerId: true, title: true },
        });
        if (listing) {
            await notification_service_1.notificationService.create({
                recipientId: listing.sellerId,
                actorId: userId,
                type: 'marketplace',
                title: 'Trao đổi mới về xe',
                message: `Đã bình luận tin "${listing.title}"`,
                link: `/market/${listingId}`,
            });
        }
        return {
            comment,
            count: await prisma_1.prisma.listingComment.count({ where: { listingId } }),
        };
    },
};
//# sourceMappingURL=vehicle.service.js.map