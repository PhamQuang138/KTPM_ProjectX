import {vehicleImageSeeds} from '../data/vehicleImages';
import {prisma} from '../config/prisma';
import {notificationService} from './notification.service';

export interface CreateGarageVehicleInput {
  title: string;
  description?: string;
  image: string;
  images?: string[];
  condition?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  specs?: string[];
  status?: string;
  ownerId: string;
}

export interface CreateVehicleListingInput {
  title: string;
  description?: string;
  price: string;
  location: string;
  category?: string;
  status?: string;
  sellerId: string;
  vehicleId?: string;
}

export type UpdateGarageVehicleInput = Partial<Omit<CreateGarageVehicleInput, 'ownerId'>>;
export type UpdateVehicleListingInput = Partial<Omit<CreateVehicleListingInput, 'sellerId'>>;

const listingInclude = {
  seller: {select: {id: true, name: true, avatar: true, email: true, role: true, isVerifiedProfessional: true}},
  vehicle: true,
  comments: {
    include: {user: {select: {id: true, name: true, email: true, avatar: true}}},
    orderBy: {createdAt: 'asc' as const},
  },
  _count: {select: {favorites: true, comments: true}},
};

const garageInclude = {
  owner: {select: {id: true, name: true, avatar: true, email: true}},
  listings: true,
};

export const vehicleService = {
  listGarageVehicles(ownerId?: string) {
    return prisma.garageVehicle.findMany({
      where: ownerId ? {ownerId} : undefined,
      include: garageInclude,
      orderBy: {createdAt: 'desc'},
    });
  },

  getGarageVehicleById(id: string) {
    return prisma.garageVehicle.findUnique({where: {id}, include: garageInclude});
  },

  findActiveListingByGarageVehicleId(vehicleId: string) {
    return prisma.vehicleListing.findFirst({
      where: {
        vehicleId,
        status: {not: 'Sold'},
      },
      include: listingInclude,
      orderBy: {createdAt: 'desc'},
    });
  },

  createGarageVehicle(input: CreateGarageVehicleInput) {
    return prisma.garageVehicle.create({
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

  updateGarageVehicle(id: string, input: UpdateGarageVehicleInput) {
    return prisma.garageVehicle.update({where: {id}, data: input, include: garageInclude});
  },

  deleteGarageVehicle(id: string) {
    return prisma.garageVehicle.delete({where: {id}});
  },

  async listListings(input: {
    category?: string;
    search?: string;
    sellerId?: string;
    condition?: string;
    make?: string;
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
    minYear?: number;
    maxYear?: number;
    page: number;
    limit: number;
    sort?: string;
    viewerId?: string;
  }) {
    const vehicleWhere = {
      ...(input.condition ? {condition: input.condition} : {}),
      ...(input.make ? {make: {equals: input.make, mode: 'insensitive' as const}} : {}),
      ...(input.bodyType ? {bodyType: {equals: input.bodyType, mode: 'insensitive' as const}} : {}),
      ...(input.fuelType ? {fuelType: {equals: input.fuelType, mode: 'insensitive' as const}} : {}),
      ...(input.transmission ? {transmission: {equals: input.transmission, mode: 'insensitive' as const}} : {}),
      ...(input.minYear || input.maxYear
        ? {year: {gte: input.minYear, lte: input.maxYear}}
        : {}),
    };
    const hasVehicleFilter = Object.keys(vehicleWhere).length > 0;
    const where = {
      ...(input.category ? {category: {equals: input.category, mode: 'insensitive' as const}} : {}),
      ...(input.search
        ? {
            OR: [
              {title: {contains: input.search, mode: 'insensitive' as const}},
              {description: {contains: input.search, mode: 'insensitive' as const}},
              {location: {contains: input.search, mode: 'insensitive' as const}},
              {vehicle: {is: {OR: [
                {make: {contains: input.search, mode: 'insensitive' as const}},
                {model: {contains: input.search, mode: 'insensitive' as const}},
              ]}}},
            ],
          }
        : {}),
      ...(input.sellerId ? {sellerId: input.sellerId} : {}),
      ...(!input.sellerId ? {status: {not: 'Hidden'}} : {}),
      ...(hasVehicleFilter ? {vehicle: {is: vehicleWhere}} : {}),
    };
    const orderBy =
      input.sort === 'trending'
        ? [{favorites: {_count: 'desc' as const}}, {comments: {_count: 'desc' as const}}, {createdAt: 'desc' as const}]
        : input.sort === 'oldest'
          ? [{createdAt: 'asc' as const}]
          : [{createdAt: 'desc' as const}];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const [items, total, activeCount, newThisWeek, verifiedSellers, dailyRows] = await Promise.all([
      prisma.vehicleListing.findMany({
        where,
        include: {
          ...listingInclude,
          favorites: input.viewerId ? {where: {userId: input.viewerId}, select: {id: true}} : false,
        },
        orderBy,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.vehicleListing.count({where}),
      prisma.vehicleListing.count({where: {status: 'Active Listing'}}),
      prisma.vehicleListing.count({where: {status: 'Active Listing', createdAt: {gte: sevenDaysAgo}}}),
      prisma.user.count({where: {isVerifiedProfessional: true, vehicleListings: {some: {status: 'Active Listing'}}}}),
      prisma.vehicleListing.findMany({
        where: {status: 'Active Listing', createdAt: {gte: sevenDaysAgo}},
        select: {createdAt: true},
      }),
    ]);
    const daily = Array.from({length: 7}, (_, index) => {
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
      stats: {activeCount, newThisWeek, verifiedSellers, daily},
    };
  },

  getListingById(id: string) {
    return prisma.vehicleListing.findUnique({where: {id}, include: listingInclude});
  },

  createListing(input: CreateVehicleListingInput) {
    return prisma.vehicleListing.create({
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

  updateListing(id: string, input: UpdateVehicleListingInput) {
    return prisma.vehicleListing.update({where: {id}, data: input, include: listingInclude});
  },

  deleteListing(id: string) {
    return prisma.vehicleListing.delete({where: {id}});
  },

  listVehicleImages() {
    return vehicleImageSeeds;
  },

  async toggleFavorite(listingId: string, userId: string) {
    const existing = await prisma.listingFavorite.findUnique({
      where: {listingId_userId: {listingId, userId}},
    });
    if (existing) {
      await prisma.listingFavorite.delete({where: {id: existing.id}});
    } else {
      await prisma.listingFavorite.create({data: {listingId, userId}});
      const listing = await prisma.vehicleListing.findUnique({
        where: {id: listingId},
        select: {sellerId: true, title: true},
      });
      if (listing) {
        await notificationService.create({
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
      count: await prisma.listingFavorite.count({where: {listingId}}),
    };
  },

  async addComment(listingId: string, userId: string, content: string) {
    const comment = await prisma.listingComment.create({
      data: {listingId, userId, content},
      include: {user: {select: {id: true, name: true, email: true, avatar: true}}},
    });
    const listing = await prisma.vehicleListing.findUnique({
      where: {id: listingId},
      select: {sellerId: true, title: true},
    });
    if (listing) {
      await notificationService.create({
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
      count: await prisma.listingComment.count({where: {listingId}}),
    };
  },
};
