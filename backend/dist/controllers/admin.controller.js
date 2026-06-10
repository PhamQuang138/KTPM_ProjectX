"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.updateArticleStatusSchema = exports.updateResourceStatusSchema = exports.updateUserVerificationSchema = exports.updatePostStatusSchema = void 0;
const zod_1 = require("zod");
const admin_service_1 = require("../services/admin.service");
exports.updatePostStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED']),
});
exports.updateUserVerificationSchema = zod_1.z.object({
    isVerifiedProfessional: zod_1.z.boolean(),
});
exports.updateResourceStatusSchema = zod_1.z.object({
    status: zod_1.z.string().trim().min(1).max(80),
});
exports.updateArticleStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED']),
});
exports.adminController = {
    async dashboard(_req, res) {
        return res.json({ data: await admin_service_1.adminService.getDashboard() });
    },
    async listUsers(_req, res) {
        return res.json({ data: await admin_service_1.adminService.listUsers() });
    },
    async deleteUser(req, res) {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }
        const targetUser = await admin_service_1.adminService.getUserById(req.params.id);
        if (!targetUser)
            return res.status(404).json({ message: 'User not found' });
        if (targetUser.role === 'ADMIN' && (await admin_service_1.adminService.countAdmins()) <= 1) {
            return res.status(400).json({ message: 'You cannot delete the last admin account' });
        }
        await admin_service_1.adminService.deleteUser(req.params.id);
        return res.json({ data: { success: true } });
    },
    async updateUserVerification(req, res) {
        const targetUser = await admin_service_1.adminService.getUserById(req.params.id);
        if (!targetUser)
            return res.status(404).json({ message: 'User not found' });
        const user = await admin_service_1.adminService.updateUserVerification(req.params.id, req.body.isVerifiedProfessional);
        return res.json({ data: user });
    },
    async listPosts(_req, res) {
        return res.json({ data: await admin_service_1.adminService.listPosts() });
    },
    async updatePostStatus(req, res) {
        const post = await admin_service_1.adminService.updatePostStatus(req.params.id, req.body.status);
        return res.json({ data: post });
    },
    async deletePost(req, res) {
        await admin_service_1.adminService.deletePost(req.params.id);
        return res.json({ data: { success: true } });
    },
    async listVehicles(_req, res) {
        return res.json({ data: await admin_service_1.adminService.listVehicleListings() });
    },
    async updateVehicleStatus(req, res) {
        return res.json({ data: await admin_service_1.adminService.updateVehicleListingStatus(req.params.id, req.body.status) });
    },
    async deleteVehicle(req, res) {
        await admin_service_1.adminService.deleteVehicle(req.params.id);
        return res.json({ data: { success: true } });
    },
    async listGarageVehicles(_req, res) {
        return res.json({ data: await admin_service_1.adminService.listGarageVehicles() });
    },
    async updateGarageVehicleStatus(req, res) {
        return res.json({ data: await admin_service_1.adminService.updateGarageVehicleStatus(req.params.id, req.body.status) });
    },
    async deleteGarageVehicle(req, res) {
        await admin_service_1.adminService.deleteGarageVehicle(req.params.id);
        return res.json({ data: { success: true } });
    },
    async listArticles(_req, res) {
        return res.json({ data: await admin_service_1.adminService.listArticles() });
    },
    async updateArticleStatus(req, res) {
        const article = await admin_service_1.adminService.updateArticleStatus(req.params.id, req.body.status);
        return res.json({ data: article });
    },
    async deleteArticle(req, res) {
        await admin_service_1.adminService.deleteArticle(req.params.id);
        return res.json({ data: { success: true } });
    },
    async listComments(_req, res) {
        return res.json({ data: await admin_service_1.adminService.listComments() });
    },
    async deleteComment(req, res) {
        await admin_service_1.adminService.deleteComment(req.params.id);
        return res.json({ data: { success: true } });
    },
    async listRatings(_req, res) {
        return res.json({ data: await admin_service_1.adminService.listRatings() });
    },
    async deleteRating(req, res) {
        await admin_service_1.adminService.deleteRating(req.params.id);
        return res.json({ data: { success: true } });
    },
    async listFollows(_req, res) {
        return res.json({ data: await admin_service_1.adminService.listFollows() });
    },
    async deleteFollow(req, res) {
        await admin_service_1.adminService.deleteFollow(req.params.id);
        return res.json({ data: { success: true } });
    },
};
//# sourceMappingURL=admin.controller.js.map