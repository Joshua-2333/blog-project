// api/controllers/commentController.js
import prisma from "../prisma/prisma.config.js";

// @desc    Get all comments
// @route   GET /api/comments
// @access  Public
export const getComments = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        post: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { content, postId } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ message: "Content and postId are required" });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: req.user.id, // comes from authenticate middleware
      },
      include: {
        user: { select: { id: true, username: true } },
        post: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (author only)
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only the author can delete
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
};
