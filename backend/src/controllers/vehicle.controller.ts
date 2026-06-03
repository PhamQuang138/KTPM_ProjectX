import {Request, Response} from 'express';
import {z} from 'zod';
import {vehicleService} from '../services/vehicle.service';

export const createListingSchema = z.object({
  image: z.string().url(),
  images: z.array(z.string().url()).max(12).optional(),
  price: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  location: z.string().min(1).max(160),
  condition: z.enum(['New', 'Used', 'Project']).optional(),
  specs: z.array(z.string().min(1).max(80)).max(12).optional(),
  category: z.enum(['Exotics', 'Classics', 'Projects', 'Daily']).optional(),
  status: z.string().min(1).max(80).optional(),
  sellerId: z.string().uuid(),
});

export const vehicleController = {
  async listListings(req: Request, res: Response) {
    const listings = await vehicleService.listListings(
      req.query.category?.toString(),
      req.query.search?.toString(),
      req.query.sellerId?.toString(),
    );
    return res.json({data: listings});
  },

  async getListingById(req: Request, res: Response) {
    const listing = await vehicleService.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({message: 'Vehicle listing not found'});
    }

    return res.json({data: listing});
  },

  async createListing(req: Request, res: Response) {
    const listing = await vehicleService.createListing(req.body);
    return res.status(201).json({data: listing});
  },

  async listGarageVehicles(req: Request, res: Response) {
    const listings = await vehicleService.listListings(undefined, undefined, req.query.sellerId?.toString());
    return res.json({data: listings});
  },

  listVehicleImages(_req: Request, res: Response) {
    res.json({
      data: vehicleService.listVehicleImages(),
    });
  },
};
