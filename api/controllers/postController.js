// api/controllers/postController.js
import prisma from "../prisma/prisma.config.js";

/**
 * GET ALL POSTS
 * - Public: only published posts
 * - Auth + ?mine=true: only the user's own posts (drafts + published)
 */
export const getPosts = async (req, res, next) => {
  try {
    const mine = req.query.mine === "true";
    const isLoggedIn = !!req.user;

    // Default: public users see only published posts
    let where = { published: true };

    // Logged-in users requesting their own posts
    if (isLoggedIn && mine) {
      where = { authorId: req.user.id };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

/**
 * GET SINGLE POST
 * - Public: only published posts
 * - Author: can view own draft
 */
export const getPostById = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, username: true } },
        comments: {
          include: { user: { select: { id: true, username: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Block access to drafts unless user is the author
    if (!post.published) {
      if (!req.user || req.user.id !== post.authorId) {
        return res.status(403).json({ message: "Not authorized to view this post" });
      }
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * CREATE POST
 * - Auth only
 * - Draft by default
 */
export const createPost = async (req, res, next) => {
  try {
    const { title, content, published = false } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        authorId: req.user.id,
      },
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE POST
 * - Auth only
 * - Author only
 */
export const updatePost = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content, published } = req.body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title ?? post.title,
        content: content ?? post.content,
        published: published ?? post.published,
      },
    });

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE POST
 * - Auth only
 * - Author only
 */
export const deletePost = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.post.delete({ where: { id: postId } });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
};
