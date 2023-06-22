"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
async function getUserNotificationHandler(req, res) {
    try {
        const { userId } = req.params;
        if (!userId || typeof userId !== 'string') {
            throw new Error('Invalid ID');
        }
        const notifications = await prisma_1.default.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        await prisma_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                hasNotification: false,
            },
        });
        return res.status(200).json(notifications);
    }
    catch (error) {
        console.log(error);
        return res.status(400).end();
    }
}
exports.default = getUserNotificationHandler;
