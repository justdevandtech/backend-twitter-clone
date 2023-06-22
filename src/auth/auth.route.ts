import { Router } from 'express';
import { CreateUser, LoginUser, validateUser } from './auth.controller';
import isAuthenticated from './../../middleware/authmiddleware';

export const authRoute = Router();

authRoute.post('/register', CreateUser);
authRoute.post('/login', LoginUser);
authRoute.get('/verify', isAuthenticated, validateUser);
