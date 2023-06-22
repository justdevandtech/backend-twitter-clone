"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoute = void 0;
const express_1 = require("express");
const authmiddleware_1 = __importDefault(require("../../middleware/authmiddleware"));
const post_controller_1 = require("./post.controller");
exports.postRoute = (0, express_1.Router)();
exports.postRoute.post('/posts', authmiddleware_1.default, post_controller_1.createPosthandler);
exports.postRoute.post('/posts/like', authmiddleware_1.default, post_controller_1.likePostHandler);
exports.postRoute.post('/posts/comments/:postId', authmiddleware_1.default, post_controller_1.postCommentHandler);
exports.postRoute.delete('/posts/unlike/:postId', authmiddleware_1.default, post_controller_1.unlikePostHandler);
exports.postRoute.get('/posts', post_controller_1.getAllPostsHandler);
exports.postRoute.get('/posts/:id', post_controller_1.getPostByIdHandler);
exports.postRoute.get('/posts/users/:userId', post_controller_1.getPostByUserIdHandler);
