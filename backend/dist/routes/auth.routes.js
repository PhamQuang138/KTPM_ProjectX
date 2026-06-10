"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validateRequest_1 = require("../middlewares/validateRequest");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/signup', (0, validateRequest_1.validateBody)(auth_controller_1.signupSchema), auth_controller_1.authController.signup);
exports.authRouter.post('/login', (0, validateRequest_1.validateBody)(auth_controller_1.loginSchema), auth_controller_1.authController.login);
exports.authRouter.post('/logout', auth_controller_1.authController.logout);
exports.authRouter.post('/forgot-password', (0, validateRequest_1.validateBody)(auth_controller_1.forgotPasswordSchema), auth_controller_1.authController.forgotPassword);
exports.authRouter.post('/reset-password', (0, validateRequest_1.validateBody)(auth_controller_1.resetPasswordSchema), auth_controller_1.authController.resetPassword);
//# sourceMappingURL=auth.routes.js.map