"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const validateRequest_1 = require("../middlewares/validateRequest");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.patch('/me/profile', auth_1.requireAuth, (0, validateRequest_1.validateBody)(user_controller_1.updateProfileSchema), user_controller_1.userController.updateOwnProfile);
exports.userRouter.get('/search/accounts', auth_1.requireAuth, user_controller_1.userController.searchUsers);
exports.userRouter.get('/suggestions/follow', auth_1.requireAuth, user_controller_1.userController.getFollowSuggestions);
exports.userRouter.get('/:id', auth_1.optionalAuth, user_controller_1.userController.getPublicProfile);
exports.userRouter.get('/:id/rating', auth_1.optionalAuth, user_controller_1.userController.getRating);
exports.userRouter.post('/:id/follow', auth_1.requireAuth, user_controller_1.userController.followUser);
exports.userRouter.delete('/:id/follow', auth_1.requireAuth, user_controller_1.userController.unfollowUser);
exports.userRouter.post('/:id/rating', auth_1.requireAuth, (0, validateRequest_1.validateBody)(user_controller_1.rateUserSchema), user_controller_1.userController.rateUser);
//# sourceMappingURL=user.routes.js.map