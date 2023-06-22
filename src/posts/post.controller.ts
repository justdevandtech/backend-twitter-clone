import { Request, Response } from 'express';
import prisma from '../prisma';

interface _Request extends Request {
  user?: {
    id: string;
  };
}

async function createPosthandler(req: _Request, res: Response) {
  const postInput = req.body;
  const userId = req.user?.id;

  try {
    const post = await prisma.post.create({
      data: {
        ...postInput,
        userId: userId,
      },
    });

    if (post) {
      return res.status(200).json({ message: 'Post created successfully' });
    }

    return res.status(404).json({ message: 'Post Creation failed!' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllPostsHandler(req: Request, res: Response) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            email: true,
            password: false, // Exclude the password field
          },
        },
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getPostByIdHandler(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Not Found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getPostByUserIdHandler(req: Request, res: Response) {
  const { userId } = req?.params;
  try {
    const post = await prisma.post.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
            email: true,
            password: false,
          },
        },
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function likePostHandler(req: _Request, res: Response) {
  const currentUserId = req.user?.id;
  const { postId } = req.body;

  try {
    if (!postId || typeof postId !== 'string') {
      return res.status(404).json({ error: 'Not Found' });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    let updatedLikedIds = [...(post?.likedIds || [])];
    updatedLikedIds.push(currentUserId as string);

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        likedIds: updatedLikedIds,
      },
    });

    if (!updatedPost) {
      return res
        .status(400)
        .json({ error: 'Invalid post id provided in update request' });
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: currentUserId,
      },
    });

    //send notification
    const _post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (_post?.userId) {
      await prisma.notification.create({
        data: {
          body: `${currentUser?.name} liked your tweet!`,
          userId: _post.userId,
        },
      });

      await prisma.user.update({
        where: {
          id: _post.userId,
        },
        data: {
          hasNotification: true,
        },
      });
    }

    res.status(200).json({ message: 'Like post successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

async function unlikePostHandler(req: _Request, res: Response) {
  const currentUserId = req.user?.id;
  const { postId } = req.params;

  try {
    if (!postId || typeof postId !== 'string') {
      return res.status(404).json({ error: 'Not Found' });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    let updatedLikedIds = [...(post?.likedIds || [])];

    updatedLikedIds = updatedLikedIds.filter(
      (likedId) => likedId !== currentUserId,
    );

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        likedIds: updatedLikedIds,
      },
    });

    if (!updatedPost) {
      return res
        .status(400)
        .json({ error: 'Invalid post id provided in update request' });
    }

    res.status(200).json({ message: 'successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

async function postCommentHandler(req: _Request, res: Response) {
  const userId = req.user?.id;

  try {
    const { body } = req.body;
    const { postId } = req.params;

    if (!postId || typeof postId !== 'string') {
      return res.status(400).send({ error: 'Invalid post id' });
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const comment = await prisma.comment.create({
      data: {
        body,
        userId: userId as string,
        postId,
      },
    });

    // NOTIFICATION PART START
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (post?.userId) {
        await prisma.notification.create({
          data: {
            body: `${currentUser?.name} commented on your tweet!`,
            userId: post.userId,
          },
        });

        await prisma.user.update({
          where: {
            id: post.userId,
          },
          data: {
            hasNotification: true,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
    // NOTIFICATION PART END

    return res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: error });
  }
}

export {
  createPosthandler,
  getAllPostsHandler,
  getPostByIdHandler,
  getPostByUserIdHandler,
  likePostHandler,
  unlikePostHandler,
  postCommentHandler,
};
