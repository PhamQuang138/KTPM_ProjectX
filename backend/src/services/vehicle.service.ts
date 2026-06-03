import {vehicleImageSeeds} from '../data/vehicleImages';
import {prisma} from '../config/prisma';

export interface CreateVehicleListingInput {
  image: string;
  images?: string[];
  price: string;
  title: string;
  location: string;
  condition?: string;
  specs?: string[];
  category?: string;
  status?: string;
  sellerId: string;
}

const vehicleInclude = {
  seller: {
    select: {
      id: true,
      name: true,
      avatar: true,
      email: true,
    },
  },
};

export const vehicleService = {
  async listListings(category?: string, search?: string, sellerId?: string) {
    return prisma.vehicle.findMany({
      where: {
        ...(category ? {category: {equals: category, mode: 'insensitive' as const}} : {}),
        ...(search ? {title: {contains: search, mode: 'insensitive' as const}} : {}),
        ...(sellerId ? {sellerId} : {}),
      },
      include: vehicleInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  getListingById(id: string) {
    return prisma.vehicle.findUnique({
      where: {id},
      include: vehicleInclude,
    });
  },

  createListing(input: CreateVehicleListingInput) {
    return prisma.vehicle.create({
      data: {
        title: input.title,
        price: input.price,
        location: input.location,
        image: input.image,
        images: input.images ?? [input.image],
        condition: input.condition ?? 'Used',
        category: input.category ?? 'Daily',
        specs: input.specs ?? [],
        status: input.status ?? 'Active Listing',
        sellerId: input.sellerId,
      },
      include: vehicleInclude,
    });
  },

  listVehicleImages() {
    return vehicleImageSeeds;
  },
};
