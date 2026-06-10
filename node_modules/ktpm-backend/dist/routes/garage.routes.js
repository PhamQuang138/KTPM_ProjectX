"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.garageRouter = void 0;
const express_1 = require("express");
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const validateRequest_1 = require("../middlewares/validateRequest");
const auth_1 = require("../middlewares/auth");
exports.garageRouter = (0, express_1.Router)();
exports.garageRouter.use(auth_1.requireAuth);
exports.garageRouter.get('/vehicles', vehicle_controller_1.vehicleController.listGarageVehicles);
exports.garageRouter.post('/vehicles', (0, validateRequest_1.validateBody)(vehicle_controller_1.createGarageVehicleSchema), vehicle_controller_1.vehicleController.createGarageVehicle);
exports.garageRouter.patch('/vehicles/:id', (0, validateRequest_1.validateBody)(vehicle_controller_1.updateGarageVehicleSchema), vehicle_controller_1.vehicleController.updateGarageVehicle);
exports.garageRouter.delete('/vehicles/:id', vehicle_controller_1.vehicleController.deleteGarageVehicle);
//# sourceMappingURL=garage.routes.js.map