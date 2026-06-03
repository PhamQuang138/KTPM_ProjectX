import {Router} from 'express';
import {createListingSchema, vehicleController} from '../controllers/vehicle.controller';
import {validateBody} from '../middlewares/validateRequest';

export const garageRouter = Router();

garageRouter.get('/vehicles', vehicleController.listGarageVehicles);
garageRouter.post('/vehicles', validateBody(createListingSchema), vehicleController.createListing);
