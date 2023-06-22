import { Express } from 'express';
import { authRoute } from './auth/auth.route';
import { userRoute } from './users/user.route';
import { postRoute } from './posts/post.route';

export const appRoutes = (app: Express) => {
  app.use('/api/v1', authRoute);
  app.use('/api/v1', userRoute);
  app.use('/api/v1', postRoute);
};
