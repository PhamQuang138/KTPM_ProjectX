import {Router} from 'express';
import {createListingSchema, vehicleController} from '../controllers/vehicle.controller';
import {validateBody} from '../middlewares/validateRequest';

export const vehicleRouter = Router();

vehicleRouter.get('/', vehicleController.listListings);
vehicleRouter.get('/images', vehicleController.listVehicleImages);
vehicleRouter.get('/:id', vehicleController.getListingById);
vehicleRouter.post('/', validateBody(createListingSchema), vehicleController.createListing);
