// api/routes/commentRoutes.js
import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
} from "../controllers/commentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET COMMENTS
 * - Public
 * - Only for published posts
 * - Optional postId filter
 */
router.get("/", getComments);

/**
 * ADD COMMENT
 * - Authenticated users only
 */
router.post("/", authenticate, addComment);

/**
 * DELETE COMMENT
 * - Author OR admin
 */
router.delete("/:id", authenticate, deleteComment);

export default router;
