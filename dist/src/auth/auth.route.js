"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoute = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const authmiddleware_1 = __importDefault(require("./../../middleware/authmiddleware"));
exports.authRoute = (0, express_1.Router)();
exports.authRoute.post('/register', auth_controller_1.CreateUser);
exports.authRoute.post('/login', auth_controller_1.LoginUser);
exports.authRoute.get('/verify', authmiddleware_1.default, auth_controller_1.validateUser);
