"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCommentHandler = exports.unlikePostHandler = exports.likePostHandler = exports.getPostByUserIdHandler = exports.getPostByIdHandler = exports.getAllPostsHandler = exports.createPosthandler = void 0;
const prisma_1 = __importDefault(require("../prisma"));
async function createPosthandler(req, res) {
    const postInput = req.body;
    const userId = req.user?.id;
    try {
        const post = await prisma_1.default.post.create({
            data: {
                ...postInput,
                userId: userId,
            },
        });
        if (post) {
            return res.status(200).json({ message: 'Post created successfully' });
        }
        return res.status(404).json({ message: 'Post Creation failed!' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.createPosthandler = createPosthandler;
async function getAllPostsHandler(req, res) {
    try {
        const posts = await prisma_1.default.post.findMany({
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.getAllPostsHandler = getAllPostsHandler;
async function getPostByIdHandler(req, res) {
    const { id } = req.params;
    try {
        const post = await prisma_1.default.post.findUnique({
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.getPostByIdHandler = getPostByIdHandler;
async function getPostByUserIdHandler(req, res) {
    const { userId } = req?.params;
    try {
        const post = await prisma_1.default.post.findMany({
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.getPostByUserIdHandler = getPostByUserIdHandler;
async function likePostHandler(req, res) {
    const currentUserId = req.user?.id;
    const { postId } = req.body;
    try {
        if (!postId || typeof postId !== 'string') {
            return res.status(404).json({ error: 'Not Found' });
        }
        const post = await prisma_1.default.post.findUnique({
            where: {
                id: postId,
            },
        });
        let updatedLikedIds = [...(post?.likedIds || [])];
        updatedLikedIds.push(currentUserId);
        const updatedPost = await prisma_1.default.post.update({
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
        const currentUser = await prisma_1.default.user.findUnique({
            where: {
                id: currentUserId,
            },
        });
        //send notification
        const _post = await prisma_1.default.post.findUnique({
            where: {
                id: postId,
            },
        });
        if (_post?.userId) {
            await prisma_1.default.notification.create({
                data: {
                    body: `${currentUser?.name} liked your tweet!`,
                    userId: _post.userId,
                },
            });
            await prisma_1.default.user.update({
                where: {
                    id: _post.userId,
                },
                data: {
                    hasNotification: true,
                },
            });
        }
        res.status(200).json({ message: 'Like post successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
exports.likePostHandler = likePostHandler;
async function unlikePostHandler(req, res) {
    const currentUserId = req.user?.id;
    const { postId } = req.params;
    try {
        if (!postId || typeof postId !== 'string') {
            return res.status(404).json({ error: 'Not Found' });
        }
        const post = await prisma_1.default.post.findUnique({
            where: {
                id: postId,
            },
        });
        let updatedLikedIds = [...(post?.likedIds || [])];
        updatedLikedIds = updatedLikedIds.filter((likedId) => likedId !== currentUserId);
        const updatedPost = await prisma_1.default.post.update({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
exports.unlikePostHandler = unlikePostHandler;
async function postCommentHandler(req, res) {
    const userId = req.user?.id;
    try {
        const { body } = req.body;
        const { postId } = req.params;
        if (!postId || typeof postId !== 'string') {
            return res.status(400).send({ error: 'Invalid post id' });
        }
        const currentUser = await prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
        });
        const comment = await prisma_1.default.comment.create({
            data: {
                body,
                userId: userId,
                postId,
            },
        });
        // NOTIFICATION PART START
        try {
            const post = await prisma_1.default.post.findUnique({
                where: {
                    id: postId,
                },
            });
            if (post?.userId) {
                await prisma_1.default.notification.create({
                    data: {
                        body: `${currentUser?.name} commented on your tweet!`,
                        userId: post.userId,
                    },
                });
                await prisma_1.default.user.update({
                    where: {
                        id: post.userId,
                    },
                    data: {
                        hasNotification: true,
                    },
                });
            }
        }
        catch (error) {
            console.log(error);
        }
        // NOTIFICATION PART END
        return res.status(200).json(comment);
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ error: error });
    }
}
exports.postCommentHandler = postCommentHandler;
