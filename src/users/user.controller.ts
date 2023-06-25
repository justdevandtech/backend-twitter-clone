import { Request, Response } from 'express';
import cloudinary from 'cloudinary';
import multer, { Multer } from 'multer';
import prisma from '../prisma';
import { User } from '@prisma/client';
import fs from 'fs';

interface UserRequest extends Request {
  user?: {
    id: string;
  };
}

//cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up file upload using multer
const upload: Multer = multer({ dest: 'uploads/' });

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
  try {
    const { userId } = req.params;
    const { name, username, bio } = req.body;

    upload.array('images')(req, res, async (err) => {
      if (err) {
        return res.status(400).send(err);
      }

      const files: Express.Multer.File[] = req.files as Express.Multer.File[];

      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const result = await cloudinary.v2.uploader.upload(file.path);
          return result.secure_url;
        }),
      );

      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          username,
          bio,
          profileImage: uploadedImages[0],
          coverImage: uploadedImages[1],
        },
      });

      res
        .status(200)
        .json({ success: true, message: 'Updated user successfully' });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Delete the uploaded files from the server
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    for (const file of files) {
      fs.unlinkSync(file.path);
    }
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
