import { Router } from 'express';
import isAuthenticated from '../../middleware/authmiddleware';
import {
  followUserHandler,
  getAllUsers,
  getMe,
  getUserById,
  unfollowUserHandler,
  updateUserProfile,
} from './user.controller';
import getUserNotificationHandler from './notification';

export const userRoute = Router();

userRoute.post('/users/follow/:userId', isAuthenticated, followUserHandler);
userRoute.delete(
  '/users/unfollow/:userId',
  isAuthenticated,
  unfollowUserHandler,
);
userRoute.patch('/users/:userId', isAuthenticated, updateUserProfile);
userRoute.get('/me', isAuthenticated, getMe);
userRoute.get(
  '/users/:userId/notifications',
  isAuthenticated,
  getUserNotificationHandler,
);
userRoute.get('/users/:userId', getUserById);
userRoute.get('/users', getAllUsers);
