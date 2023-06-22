"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const express_1 = require("express");
const authmiddleware_1 = __importDefault(require("../../middleware/authmiddleware"));
const user_controller_1 = require("./user.controller");
const notification_1 = __importDefault(require("./notification"));
exports.userRoute = (0, express_1.Router)();
exports.userRoute.post('/users/follow/:userId', authmiddleware_1.default, user_controller_1.followUserHandler);
exports.userRoute.delete('/users/unfollow/:userId', authmiddleware_1.default, user_controller_1.unfollowUserHandler);
exports.userRoute.patch('/users/:userId', authmiddleware_1.default, user_controller_1.updateUserProfile);
exports.userRoute.get('/me', authmiddleware_1.default, user_controller_1.getMe);
exports.userRoute.get('/users/:userId/notifications', authmiddleware_1.default, notification_1.default);
exports.userRoute.get('/users/:userId', user_controller_1.getUserById);
exports.userRoute.get('/users', user_controller_1.getAllUsers);
