import {vehicleImageSeeds} from '../data/vehicleImages';
import {prisma} from '../config/prisma';

export interface CreateGarageVehicleInput {
  title: string;
  description?: string;
  image: string;
  images?: string[];
  condition?: string;
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
  seller: {select: {id: true, name: true, avatar: true, email: true}},
  vehicle: true,
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

  createGarageVehicle(input: CreateGarageVehicleInput) {
    return prisma.garageVehicle.create({
      data: {
        title: input.title,
        description: input.description,
        image: input.image,
        images: input.images ?? [input.image],
        condition: input.condition ?? 'Used',
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

  listListings(category?: string, search?: string, sellerId?: string) {
    return prisma.vehicleListing.findMany({
      where: {
        ...(category ? {category: {equals: category, mode: 'insensitive' as const}} : {}),
        ...(search ? {title: {contains: search, mode: 'insensitive' as const}} : {}),
        ...(sellerId ? {sellerId} : {}),
      },
      include: listingInclude,
      orderBy: {createdAt: 'desc'},
    });
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
};
