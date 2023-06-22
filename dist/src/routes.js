"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoutes = void 0;
const auth_route_1 = require("./auth/auth.route");
const user_route_1 = require("./users/user.route");
const post_route_1 = require("./posts/post.route");
const appRoutes = (app) => {
    app.use('/api/v1', auth_route_1.authRoute);
    app.use('/api/v1', user_route_1.userRoute);
    app.use('/api/v1', post_route_1.postRoute);
};
exports.appRoutes = appRoutes;
