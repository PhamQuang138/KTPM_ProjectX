import {Router} from 'express';
import {createGarageVehicleSchema, updateGarageVehicleSchema, vehicleController} from '../controllers/vehicle.controller';
import {validateBody} from '../middlewares/validateRequest';

export const garageRouter = Router();

garageRouter.get('/vehicles', vehicleController.listGarageVehicles);
garageRouter.post('/vehicles', validateBody(createGarageVehicleSchema), vehicleController.createGarageVehicle);
garageRouter.patch('/vehicles/:id', validateBody(updateGarageVehicleSchema), vehicleController.updateGarageVehicle);
garageRouter.delete('/vehicles/:id', vehicleController.deleteGarageVehicle);
