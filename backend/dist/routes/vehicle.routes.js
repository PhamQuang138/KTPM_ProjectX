"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRouter = void 0;
const express_1 = require("express");
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const validateRequest_1 = require("../middlewares/validateRequest");
const auth_1 = require("../middlewares/auth");
exports.vehicleRouter = (0, express_1.Router)();
exports.vehicleRouter.get('/', auth_1.optionalAuth, vehicle_controller_1.vehicleController.listListings);
exports.vehicleRouter.get('/images', vehicle_controller_1.vehicleController.listVehicleImages);
exports.vehicleRouter.get('/:id', vehicle_controller_1.vehicleController.getListingById);
exports.vehicleRouter.post('/', auth_1.requireAuth, (0, validateRequest_1.validateBody)(vehicle_controller_1.createListingSchema), vehicle_controller_1.vehicleController.createListing);
exports.vehicleRouter.patch('/:id', auth_1.requireAuth, (0, validateRequest_1.validateBody)(vehicle_controller_1.updateListingSchema), vehicle_controller_1.vehicleController.updateListing);
exports.vehicleRouter.delete('/:id', auth_1.requireAuth, vehicle_controller_1.vehicleController.deleteListing);
exports.vehicleRouter.post('/:id/favorite', auth_1.requireAuth, vehicle_controller_1.vehicleController.toggleFavorite);
exports.vehicleRouter.post('/:id/comments', auth_1.requireAuth, (0, validateRequest_1.validateBody)(vehicle_controller_1.listingCommentSchema), vehicle_controller_1.vehicleController.addComment);
//# sourceMappingURL=vehicle.routes.js.map