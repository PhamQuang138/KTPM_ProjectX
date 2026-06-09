import {Router} from 'express';
import {createListingSchema, listingCommentSchema, updateListingSchema, vehicleController} from '../controllers/vehicle.controller';
import {validateBody} from '../middlewares/validateRequest';
import {optionalAuth, requireAuth} from '../middlewares/auth';

export const vehicleRouter = Router();

vehicleRouter.get('/', optionalAuth, vehicleController.listListings);
vehicleRouter.get('/images', vehicleController.listVehicleImages);
vehicleRouter.get('/:id', vehicleController.getListingById);
vehicleRouter.post('/', requireAuth, validateBody(createListingSchema), vehicleController.createListing);
vehicleRouter.patch('/:id', requireAuth, validateBody(updateListingSchema), vehicleController.updateListing);
vehicleRouter.delete('/:id', requireAuth, vehicleController.deleteListing);
vehicleRouter.post('/:id/favorite', requireAuth, vehicleController.toggleFavorite);
vehicleRouter.post('/:id/comments', requireAuth, validateBody(listingCommentSchema), vehicleController.addComment);
