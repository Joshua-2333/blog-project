// api/controllers/commentController.js
import prisma from "../prisma/prisma.config.js";

/**
 * GET COMMENTS
 * - Public: only comments for published posts*/
 export const getComments = async (req, res, next) => {
  try {
    const postId = req.query.postId ? parseInt(req.query.postId) : undefined;

    const comments = await prisma.comment.findMany({
      where: {
        ...(postId && { postId }),// filter by postId if provided
        post: { published: true },// only published posts
      },
      include: {
        user: { select: { id: true, username: true } },// include comment author
        post: { select: { id: true, title: true } },// include post info
      },
      orderBy: { createdAt: "desc" },// newest first
    });

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

/**
 * ADD COMMENT
 * - Authenticated users only
 * - Can only comment on published posts
 */
export const addComment = async (req, res, next) => {
  try {
    const { content, postId } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ message: "Content and postId are required" });
    }

    // Ensure the post exists AND is published
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        published: true,
      },
    });

    if (!post) {
      return res.status(400).json({ message: "Cannot comment on unpublished post" });
    }

    // Create the comment
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
 * - Authenticated users only
 * - Only the comment author can delete
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

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
};
