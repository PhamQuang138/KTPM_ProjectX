"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingCommentSchema = exports.vehicleController = exports.updateListingSchema = exports.createListingSchema = exports.updateGarageVehicleSchema = exports.createGarageVehicleSchema = void 0;
const zod_1 = require("zod");
const vehicle_service_1 = require("../services/vehicle.service");
exports.createGarageVehicleSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(160),
    description: zod_1.z.string().max(5000).optional(),
    image: zod_1.z.string().url(),
    images: zod_1.z.array(zod_1.z.string().url()).max(12).optional(),
    condition: zod_1.z.enum(['New', 'Used', 'Project']).optional(),
    make: zod_1.z.string().trim().max(80).optional(),
    model: zod_1.z.string().trim().max(80).optional(),
    year: zod_1.z.number().int().min(1886).max(new Date().getFullYear() + 1).optional(),
    mileage: zod_1.z.number().int().min(0).max(5000000).optional(),
    bodyType: zod_1.z.string().trim().max(80).optional(),
    fuelType: zod_1.z.string().trim().max(80).optional(),
    transmission: zod_1.z.string().trim().max(80).optional(),
    specs: zod_1.z.array(zod_1.z.string().min(1).max(80)).max(12).optional(),
    status: zod_1.z.string().min(1).max(80).optional(),
});
exports.updateGarageVehicleSchema = exports.createGarageVehicleSchema.partial().refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field is required',
});
exports.createListingSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(160),
    description: zod_1.z.string().max(5000).optional(),
    price: zod_1.z.string().min(1).max(80),
    location: zod_1.z.string().min(1).max(160),
    category: zod_1.z.enum(['Exotics', 'Classics', 'Projects', 'Daily']).optional(),
    status: zod_1.z.string().min(1).max(80).optional(),
    vehicleId: zod_1.z.string().uuid().optional(),
});
exports.updateListingSchema = exports.createListingSchema.partial().refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field is required',
});
exports.vehicleController = {
    async listListings(req, res) {
        const result = await vehicle_service_1.vehicleService.listListings({
            category: req.query.category?.toString(),
            search: req.query.search?.toString(),
            sellerId: req.query.sellerId?.toString(),
            condition: req.query.condition?.toString(),
            make: req.query.make?.toString(),
            bodyType: req.query.bodyType?.toString(),
            fuelType: req.query.fuelType?.toString(),
            transmission: req.query.transmission?.toString(),
            minYear: Number(req.query.minYear) || undefined,
            maxYear: Number(req.query.maxYear) || undefined,
            page: Math.max(1, Number(req.query.page) || 1),
            limit: Math.min(50, Math.max(1, Number(req.query.limit) || 10)),
            sort: req.query.sort?.toString(),
            viewerId: req.user?.id,
        });
        return res.json({ data: result });
    },
    async getListingById(req, res) {
        const listing = await vehicle_service_1.vehicleService.getListingById(req.params.id);
        if (!listing)
            return res.status(404).json({ message: 'Vehicle listing not found' });
        return res.json({ data: listing });
    },
    async createListing(req, res) {
        if (req.body.vehicleId) {
            const vehicle = await vehicle_service_1.vehicleService.getGarageVehicleById(req.body.vehicleId);
            if (!vehicle)
                return res.status(404).json({ message: 'Garage vehicle not found' });
            if (vehicle.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
                return res.status(403).json({ message: 'You cannot list another user\'s vehicle' });
            }
            const activeListing = await vehicle_service_1.vehicleService.findActiveListingByGarageVehicleId(req.body.vehicleId);
            if (activeListing) {
                return res.status(409).json({ message: 'This vehicle already has an active marketplace listing' });
            }
        }
        const listing = await vehicle_service_1.vehicleService.createListing({ ...req.body, sellerId: req.user.id });
        return res.status(201).json({ data: listing });
    },
    async updateListing(req, res) {
        const current = await vehicle_service_1.vehicleService.getListingById(req.params.id);
        if (!current)
            return res.status(404).json({ message: 'Vehicle listing not found' });
        if (current.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'You cannot update another user\'s listing' });
        }
        if (req.body.vehicleId && req.body.vehicleId !== current.vehicleId) {
            const vehicle = await vehicle_service_1.vehicleService.getGarageVehicleById(req.body.vehicleId);
            if (!vehicle)
                return res.status(404).json({ message: 'Garage vehicle not found' });
            if (vehicle.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
                return res.status(403).json({ message: 'You cannot attach another user\'s vehicle to this listing' });
            }
            const activeListing = await vehicle_service_1.vehicleService.findActiveListingByGarageVehicleId(req.body.vehicleId);
            if (activeListing && activeListing.id !== current.id) {
                return res.status(409).json({ message: 'This vehicle already has an active marketplace listing' });
            }
        }
        const listing = await vehicle_service_1.vehicleService.updateListing(req.params.id, req.body);
        return res.json({ data: listing });
    },
    async deleteListing(req, res) {
        const current = await vehicle_service_1.vehicleService.getListingById(req.params.id);
        if (!current)
            return res.status(404).json({ message: 'Vehicle listing not found' });
        if (current.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'You cannot delete another user\'s listing' });
        }
        await vehicle_service_1.vehicleService.deleteListing(req.params.id);
        return res.json({ data: { success: true } });
    },
    async listGarageVehicles(req, res) {
        const vehicles = await vehicle_service_1.vehicleService.listGarageVehicles(req.user.role === 'ADMIN' ? req.query.ownerId?.toString() : req.user.id);
        return res.json({ data: vehicles });
    },
    async createGarageVehicle(req, res) {
        const vehicle = await vehicle_service_1.vehicleService.createGarageVehicle({ ...req.body, ownerId: req.user.id });
        return res.status(201).json({ data: vehicle });
    },
    async updateGarageVehicle(req, res) {
        const current = await vehicle_service_1.vehicleService.getGarageVehicleById(req.params.id);
        if (!current)
            return res.status(404).json({ message: 'Garage vehicle not found' });
        if (current.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'You cannot update another user\'s vehicle' });
        }
        const vehicle = await vehicle_service_1.vehicleService.updateGarageVehicle(req.params.id, req.body);
        return res.json({ data: vehicle });
    },
    async deleteGarageVehicle(req, res) {
        const current = await vehicle_service_1.vehicleService.getGarageVehicleById(req.params.id);
        if (!current)
            return res.status(404).json({ message: 'Garage vehicle not found' });
        if (current.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'You cannot delete another user\'s vehicle' });
        }
        await vehicle_service_1.vehicleService.deleteGarageVehicle(req.params.id);
        return res.json({ data: { success: true } });
    },
    listVehicleImages(_req, res) {
        return res.json({ data: vehicle_service_1.vehicleService.listVehicleImages() });
    },
    async toggleFavorite(req, res) {
        const listing = await vehicle_service_1.vehicleService.getListingById(req.params.id);
        if (!listing)
            return res.status(404).json({ message: 'Không tìm thấy tin đăng' });
        return res.json({ data: await vehicle_service_1.vehicleService.toggleFavorite(req.params.id, req.user.id) });
    },
    async addComment(req, res) {
        const listing = await vehicle_service_1.vehicleService.getListingById(req.params.id);
        if (!listing)
            return res.status(404).json({ message: 'Không tìm thấy tin đăng' });
        return res.status(201).json({
            data: await vehicle_service_1.vehicleService.addComment(req.params.id, req.user.id, req.body.content),
        });
    },
};
exports.listingCommentSchema = zod_1.z.object({
    content: zod_1.z.string().trim().min(1).max(2000),
});
//# sourceMappingURL=vehicle.controller.js.map