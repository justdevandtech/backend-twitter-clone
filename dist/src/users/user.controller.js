"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollowUserHandler = exports.followUserHandler = exports.getAllUsers = exports.updateUserProfile = exports.getUserById = exports.getMe = void 0;
const prisma_1 = __importDefault(require("../prisma"));
async function getMe(req, res) {
    const id = req.user?.id;
    try {
        const me = await prisma_1.default.user.findUnique({ where: { id } });
        const { password, ...result } = me;
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ ...result });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.getMe = getMe;
async function getUserById(req, res) {
    const { userId } = req.params;
    try {
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const followersCount = await prisma_1.default.user.count({
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.getUserById = getUserById;
async function updateUserProfile(req, res) {
    const body = req.body;
    const { userId } = req.params;
    try {
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.updateUserProfile = updateUserProfile;
async function getAllUsers(_, res) {
    try {
        const users = await prisma_1.default.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!users) {
            return res.status(404).json({ error: 'Data not found' });
        }
        return res
            .status(200)
            .json(users.map(({ password, ...users }) => ({ ...users })));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.getAllUsers = getAllUsers;
async function followUserHandler(req, res) {
    const { followerId } = req.body;
    try {
        const { userId } = req.params; // Get the ID of the user to follow
        const userToFollow = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!userToFollow) {
            return res.status(404).json({ error: 'User not found.' });
        }
        // Add the follower's ID to the user's followingIds array
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                followingIds: {
                    push: followerId,
                },
            },
        });
        const currentUser = await prisma_1.default.user.findUnique({
            where: {
                id: followerId,
            },
        });
        // NOTIFICATION PART START
        try {
            await prisma_1.default.notification.create({
                data: {
                    body: `${currentUser?.name} followed you!`,
                    userId,
                },
            });
            await prisma_1.default.user.update({
                where: {
                    id: userId,
                },
                data: {
                    hasNotification: true,
                },
            });
        }
        catch (error) {
            console.log(error);
        }
        // NOTIFICATION PART END
        res.json({ message: 'User followed successfully.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
exports.followUserHandler = followUserHandler;
async function unfollowUserHandler(req, res) {
    const followerId = req.user?.id;
    try {
        const { userId } = req.params;
        const userToUnfollow = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!userToUnfollow) {
            return res.status(404).json({ error: 'User not found.' });
        }
        // Remove the follower's ID from the user's followingIds array
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                followingIds: {
                    set: userToUnfollow.followingIds.filter((id) => id !== followerId),
                },
            },
        });
        res.json({ message: 'User unfollowed successfully.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
exports.unfollowUserHandler = unfollowUserHandler;
