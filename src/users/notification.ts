import { Request, Response } from 'express';
import prisma from '../prisma';

export default async function getUserNotificationHandler(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid ID');
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hasNotification: false,
      },
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
