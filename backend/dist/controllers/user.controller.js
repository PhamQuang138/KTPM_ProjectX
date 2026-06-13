"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.updateSettingsSchema = exports.updateProfileSchema = exports.rateUserSchema = void 0;
const zod_1 = require("zod");
const user_service_1 = require("../services/user.service");
exports.rateUserSchema = zod_1.z.object({
    score: zod_1.z.number().int().min(1).max(5),
});
exports.updateProfileSchema = zod_1.z.object({
    avatar: zod_1.z.string().url().max(2048).nullable().optional(),
    bannerImage: zod_1.z.string().url().max(2048).nullable().optional(),
    bio: zod_1.z.string().trim().max(1000).nullable().optional(),
    location: zod_1.z.string().trim().max(120).nullable().optional(),
    focusBrands: zod_1.z.array(zod_1.z.string().trim().min(1).max(40)).max(12).optional(),
});
exports.updateSettingsSchema = zod_1.z.object({
    themePreference: zod_1.z.enum(['system', 'dark', 'light']).optional(),
    displayDensity: zod_1.z.enum(['comfortable', 'compact']).optional(),
    fontScale: zod_1.z.enum(['small', 'normal', 'large']).optional(),
    autoOpenChatbot: zod_1.z.boolean().optional(),
    notifySocial: zod_1.z.boolean().optional(),
    notifyMarketplace: zod_1.z.boolean().optional(),
    notifyMessages: zod_1.z.boolean().optional(),
});
exports.userController = {
    async getOwnSettings(req, res) {
        return res.json({ data: await user_service_1.userService.getOwnSettings(req.user.id) });
    },
    async updateOwnSettings(req, res) {
        return res.json({ data: await user_service_1.userService.updateOwnSettings(req.user.id, req.body) });
    },
    async getFollowSuggestions(req, res) {
        return res.json({ data: await user_service_1.userService.getFollowSuggestions(req.user.id) });
    },
    async searchUsers(req, res) {
        const query = req.query.q?.toString() ?? '';
        return res.json({ data: await user_service_1.userService.searchUsers(query, req.user.id) });
    },
    async getPublicProfile(req, res) {
        const profile = await user_service_1.userService.getPublicProfile(req.params.id, req.user?.id);
        if (!profile)
            return res.status(404).json({ message: 'User not found' });
        return res.json({ data: profile });
    },
    async getRating(req, res) {
        const rating = await user_service_1.userService.getRating(req.params.id, req.user?.id);
        if (!rating)
            return res.status(404).json({ message: 'User not found' });
        return res.json({ data: rating });
    },
    async updateOwnProfile(req, res) {
        const profile = await user_service_1.userService.updateOwnProfile(req.user.id, req.body);
        return res.json({ data: profile });
    },
    async rateUser(req, res) {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot rate yourself' });
        }
        const rating = await user_service_1.userService.rateUser(req.params.id, req.user.id, req.body.score);
        if (!rating)
            return res.status(404).json({ message: 'User not found' });
        return res.json({ data: rating });
    },
    async followUser(req, res) {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }
        const result = await user_service_1.userService.followUser(req.params.id, req.user.id);
        if (!result)
            return res.status(404).json({ message: 'User not found' });
        return res.json({ data: result });
    },
    async unfollowUser(req, res) {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot unfollow yourself' });
        }
        const result = await user_service_1.userService.unfollowUser(req.params.id, req.user.id);
        if (!result)
            return res.status(404).json({ message: 'User not found' });
        return res.json({ data: result });
    },
};
//# sourceMappingURL=user.controller.js.map