// api/controllers/postController.js
import prisma from "../prisma/prisma.config.js";

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, username: true, email: true } },
        comments: {
          include: { user: { select: { id: true, username: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, username: true, email: true } },
        comments: {
          include: { user: { select: { id: true, username: true } } },
        },
      },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { title, content, published } = req.body;
    const userId = req.user.id; // from authenticate middleware

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId: userId,
      },
      include: { author: { select: { id: true, username: true } } },
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (author only)
export const updatePost = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content, published } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.authorId !== userId) return res.status(403).json({ message: "Not authorized" });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content, published },
      include: { author: { select: { id: true, username: true } } },
    });

    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (author only)
export const deletePost = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.authorId !== userId) return res.status(403).json({ message: "Not authorized" });

    await prisma.post.delete({ where: { id: postId } });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
};
