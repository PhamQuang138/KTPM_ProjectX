import {Request, Response} from 'express';
import {z} from 'zod';
import {vehicleService} from '../services/vehicle.service';
import {AuthenticatedRequest} from '../middlewares/auth';

export const createGarageVehicleSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(5000).optional(),
  image: z.string().url(),
  images: z.array(z.string().url()).max(12).optional(),
  condition: z.enum(['New', 'Used', 'Project']).optional(),
  specs: z.array(z.string().min(1).max(80)).max(12).optional(),
  status: z.string().min(1).max(80).optional(),
});

export const updateGarageVehicleSchema = createGarageVehicleSchema.partial().refine((input) => Object.keys(input).length > 0, {
  message: 'At least one field is required',
});

export const createListingSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(5000).optional(),
  price: z.string().min(1).max(80),
  location: z.string().min(1).max(160),
  category: z.enum(['Exotics', 'Classics', 'Projects', 'Daily']).optional(),
  status: z.string().min(1).max(80).optional(),
  vehicleId: z.string().uuid().optional(),
});

export const updateListingSchema = createListingSchema.partial().refine((input) => Object.keys(input).length > 0, {
  message: 'At least one field is required',
});

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

  async createListing(req: AuthenticatedRequest, res: Response) {
    if (req.body.vehicleId) {
      const vehicle = await vehicleService.getGarageVehicleById(req.body.vehicleId);
      if (!vehicle) return res.status(404).json({message: 'Garage vehicle not found'});
      if (vehicle.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json({message: 'You cannot list another user\'s vehicle'});
      }

      const activeListing = await vehicleService.findActiveListingByGarageVehicleId(req.body.vehicleId);
      if (activeListing) {
        return res.status(409).json({message: 'This vehicle already has an active marketplace listing'});
      }
    }

    const listing = await vehicleService.createListing({...req.body, sellerId: req.user!.id});
    return res.status(201).json({data: listing});
  },

  async updateListing(req: AuthenticatedRequest, res: Response) {
    const current = await vehicleService.getListingById(req.params.id);
    if (!current) return res.status(404).json({message: 'Vehicle listing not found'});
    if (current.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({message: 'You cannot update another user\'s listing'});
    }

    if (req.body.vehicleId && req.body.vehicleId !== current.vehicleId) {
      const vehicle = await vehicleService.getGarageVehicleById(req.body.vehicleId);
      if (!vehicle) return res.status(404).json({message: 'Garage vehicle not found'});
      if (vehicle.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json({message: 'You cannot attach another user\'s vehicle to this listing'});
      }

      const activeListing = await vehicleService.findActiveListingByGarageVehicleId(req.body.vehicleId);
      if (activeListing && activeListing.id !== current.id) {
        return res.status(409).json({message: 'This vehicle already has an active marketplace listing'});
      }
    }

    const listing = await vehicleService.updateListing(req.params.id, req.body);
    return res.json({data: listing});
  },

  async deleteListing(req: AuthenticatedRequest, res: Response) {
    const current = await vehicleService.getListingById(req.params.id);
    if (!current) return res.status(404).json({message: 'Vehicle listing not found'});
    if (current.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({message: 'You cannot delete another user\'s listing'});
    }
    await vehicleService.deleteListing(req.params.id);
    return res.json({data: {success: true}});
  },

  async listGarageVehicles(req: AuthenticatedRequest, res: Response) {
    const vehicles = await vehicleService.listGarageVehicles(req.user!.role === 'ADMIN' ? req.query.ownerId?.toString() : req.user!.id);
    return res.json({data: vehicles});
  },

  async createGarageVehicle(req: AuthenticatedRequest, res: Response) {
    const vehicle = await vehicleService.createGarageVehicle({...req.body, ownerId: req.user!.id});
    return res.status(201).json({data: vehicle});
  },

  async updateGarageVehicle(req: AuthenticatedRequest, res: Response) {
    const current = await vehicleService.getGarageVehicleById(req.params.id);
    if (!current) return res.status(404).json({message: 'Garage vehicle not found'});
    if (current.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({message: 'You cannot update another user\'s vehicle'});
    }
    const vehicle = await vehicleService.updateGarageVehicle(req.params.id, req.body);
    return res.json({data: vehicle});
  },

  async deleteGarageVehicle(req: AuthenticatedRequest, res: Response) {
    const current = await vehicleService.getGarageVehicleById(req.params.id);
    if (!current) return res.status(404).json({message: 'Garage vehicle not found'});
    if (current.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({message: 'You cannot delete another user\'s vehicle'});
    }
    await vehicleService.deleteGarageVehicle(req.params.id);
    return res.json({data: {success: true}});
  },

  listVehicleImages(_req: Request, res: Response) {
    return res.json({data: vehicleService.listVehicleImages()});
  },
};
