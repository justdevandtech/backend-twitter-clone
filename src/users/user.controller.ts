import { Request, Response } from 'express';
import prisma from '../prisma';
import { User } from '@prisma/client';

interface UserRequest extends Request {
  user?: {
    id: string;
  };
}

async function getMe(req: UserRequest, res: Response) {
  const id = req.user?.id;

  try {
    const me = await prisma.user.findUnique({ where: { id } });
    const { password, ...result } = me as User;

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ ...result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserById(req: Request, res: Response) {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followersCount = await prisma.user.count({
      where: {
        followingIds: {
          has: userId,
        },
      },
    });

    const { password, ...data } = user;

    return res.status(200).json({
      ...data,
      followersCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateUserProfile(req: Request, res: Response) {
  const body = req.body;
  const { userId } = req.params;
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: body.name,
        username: body.username,
        bio: body.bio,
        profileImage: body.profileImage,
        coverImage: body.coverImage,
      },
    });

    if (updatedUser) {
      return res
        .status(200)
        .json({ success: true, message: 'Updated user successfully' });
    }

    return res.status(404).json({ error: 'Fail to update user' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllUsers(_: any, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (!users) {
      return res.status(404).json({ error: 'Data not found' });
    }

    return res
      .status(200)
      .json(users.map(({ password, ...users }) => ({ ...users })) as User[]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function followUserHandler(req: Request, res: Response) {
  const { followerId } = req.body;

  try {
    const { userId } = req.params; // Get the ID of the user to follow

    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Add the follower's ID to the user's followingIds array
    await prisma.user.update({
      where: { id: userId },
      data: {
        followingIds: {
          push: followerId,
        },
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: {
        id: followerId,
      },
    });

    // NOTIFICATION PART START
    try {
      await prisma.notification.create({
        data: {
          body: `${currentUser?.name} followed you!`,
          userId,
        },
      });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          hasNotification: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
    // NOTIFICATION PART END

    res.json({ message: 'User followed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

async function unfollowUserHandler(req: UserRequest, res: Response) {
  const followerId = req.user?.id;

  try {
    const { userId } = req.params;

    const userToUnfollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Remove the follower's ID from the user's followingIds array
    await prisma.user.update({
      where: { id: userId },
      data: {
        followingIds: {
          set: userToUnfollow.followingIds.filter((id) => id !== followerId),
        },
      },
    });

    res.json({ message: 'User unfollowed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

export {
  getMe,
  getUserById,
  updateUserProfile,
  getAllUsers,
  followUserHandler,
  unfollowUserHandler,
};
