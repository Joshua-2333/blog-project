// api/controllers/postController.js
import prisma from "../prisma/prisma.config.js";

/**
 * GET POSTS
 * - Public: published only
 * - Admin + ?mine=true: drafts + published
 */
export const getPosts = async (req, res, next) => {
  try {
    const mine = req.query.mine === "true";
    const isAdmin = req.user?.role === "ADMIN";

    let where = { published: true };

    if (mine && isAdmin) {
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
 */
export const getPostById = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, username: true } },
        comments: {
          include: {
            user: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.published && req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * CREATE POST
 * - ADMIN ONLY
 */
export const createPost = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { title, content, published = false } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content required",
      });
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
 * - ADMIN ONLY
 */
export const updatePost = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const postId = parseInt(req.params.id);
    const { title, content, published } = req.body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
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
 * - ADMIN ONLY
 */
export const deletePost = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const postId = parseInt(req.params.id);

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};
