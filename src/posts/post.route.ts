import { Router } from 'express';
import isAuthenticated from '../../middleware/authmiddleware';
import {
  createPosthandler,
  getAllPostsHandler,
  getPostByIdHandler,
  getPostByUserIdHandler,
  likePostHandler,
  postCommentHandler,
  unlikePostHandler,
} from './post.controller';

export const postRoute = Router();

postRoute.post('/posts', isAuthenticated, createPosthandler);
postRoute.post('/posts/like', isAuthenticated, likePostHandler);
postRoute.post('/posts/comments/:postId', isAuthenticated, postCommentHandler);
postRoute.delete('/posts/unlike/:postId', isAuthenticated, unlikePostHandler);
postRoute.get('/posts', getAllPostsHandler);
postRoute.get('/posts/:id', getPostByIdHandler);
postRoute.get('/posts/users/:userId', getPostByUserIdHandler);
