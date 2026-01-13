// api/routes/postRoutes.js
import express from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (auth optional for enhanced behavior)
router.get("/", optionalAuthenticate, getPosts);
router.get("/:id", optionalAuthenticate, getPostById);

// Protected routes
router.post("/", authenticate, createPost);
router.put("/:id", authenticate, updatePost);
router.delete("/:id", authenticate, deletePost);

export default router;
