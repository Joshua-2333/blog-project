// api/controllers/commentController.js
import prisma from "../prisma/prisma.config.js";

/**
 * GET COMMENTS (PUBLIC)
 * - Only comments on published posts
 * - Optional postId filter
 */
export const getComments = async (req, res, next) => {
  try {
    const postId = req.query.postId
      ? parseInt(req.query.postId)
      : undefined;

    const comments = await prisma.comment.findMany({
      where: {
        ...(postId && { postId }),
        post: { published: true },
      },
      include: {
        user: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

/**
 * GET COMMENTS BY USER
 * - Authenticated
 * - User sees their own comments
 * - Admin can see any user's comments
 */
export const getCommentsByUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    if (req.user.role !== "ADMIN" && req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const comments = await prisma.comment.findMany({
      where: {
        userId,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            published: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

/**
 * GET ALL COMMENTS (ADMIN ONLY)
 * - Includes unpublished posts
 */
export const getAllCommentsAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const comments = await prisma.comment.findMany({
      include: {
        user: { select: { id: true, username: true } },
        post: { select: { id: true, title: true, published: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

/**
 * ADD COMMENT
 * - Authenticated users only
 * - Published posts only
 */
export const addComment = async (req, res, next) => {
  try {
    const { content, postId } = req.body;

    if (!content?.trim() || !postId) {
      return res
        .status(400)
        .json({ message: "Content and postId are required" });
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, published: true },
    });

    if (!post) {
      return res
        .status(400)
        .json({ message: "Cannot comment on unpublished post" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE COMMENT
 * - Owner OR admin
 */
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isOwner = comment.userId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
};
