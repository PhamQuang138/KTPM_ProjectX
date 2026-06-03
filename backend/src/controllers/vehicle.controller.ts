import {Request, Response} from 'express';
import {z} from 'zod';
import {vehicleService} from '../services/vehicle.service';

export const createGarageVehicleSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(5000).optional(),
  image: z.string().url(),
  images: z.array(z.string().url()).max(12).optional(),
  condition: z.enum(['New', 'Used', 'Project']).optional(),
  specs: z.array(z.string().min(1).max(80)).max(12).optional(),
  status: z.string().min(1).max(80).optional(),
  ownerId: z.string().uuid(),
});

export const updateGarageVehicleSchema = createGarageVehicleSchema.partial().omit({ownerId: true});

export const createListingSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(5000).optional(),
  price: z.string().min(1).max(80),
  location: z.string().min(1).max(160),
  category: z.enum(['Exotics', 'Classics', 'Projects', 'Daily']).optional(),
  status: z.string().min(1).max(80).optional(),
  sellerId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
});

export const updateListingSchema = createListingSchema.partial().omit({sellerId: true});

export const vehicleController = {
  async listListings(req: Request, res: Response) {
    const listings = await vehicleService.listListings(req.query.category?.toString(), req.query.search?.toString(), req.query.sellerId?.toString());
    return res.json({data: listings});
  },

  async getListingById(req: Request, res: Response) {
    const listing = await vehicleService.getListingById(req.params.id);
    if (!listing) return res.status(404).json({message: 'Vehicle listing not found'});
    return res.json({data: listing});
  },

  async createListing(req: Request, res: Response) {
    const listing = await vehicleService.createListing(req.body);
    return res.status(201).json({data: listing});
  },

  async updateListing(req: Request, res: Response) {
    const listing = await vehicleService.updateListing(req.params.id, req.body);
    return res.json({data: listing});
  },

  async deleteListing(req: Request, res: Response) {
    await vehicleService.deleteListing(req.params.id);
    return res.json({data: {success: true}});
  },

  async listGarageVehicles(req: Request, res: Response) {
    const vehicles = await vehicleService.listGarageVehicles(req.query.ownerId?.toString());
    return res.json({data: vehicles});
  },

  async createGarageVehicle(req: Request, res: Response) {
    const vehicle = await vehicleService.createGarageVehicle(req.body);
    return res.status(201).json({data: vehicle});
  },

  async updateGarageVehicle(req: Request, res: Response) {
    const vehicle = await vehicleService.updateGarageVehicle(req.params.id, req.body);
    return res.json({data: vehicle});
  },

  async deleteGarageVehicle(req: Request, res: Response) {
    await vehicleService.deleteGarageVehicle(req.params.id);
    return res.json({data: {success: true}});
  },

  listVehicleImages(_req: Request, res: Response) {
    return res.json({data: vehicleService.listVehicleImages()});
  },
};
