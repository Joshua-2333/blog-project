// api/routes/commentRoutes.js
import express from "express";
import {
  getComments,
  getCommentsByUser,
  getAllCommentsAdmin,
  addComment,
  deleteComment,
} from "../controllers/commentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET COMMENTS
 * - Public
 * - Only for published posts
 * - Optional postId filter (?postId=)
 */
router.get("/", getComments);

/**
 * GET COMMENTS BY USER
 * - Authenticated
 * - Used for user profile page
 * - User can only view their own comments unless admin
 */
router.get("/user/:userId", authenticate, getCommentsByUser);

/**
 * GET ALL COMMENTS (ADMIN)
 * - Admin only
 * - Used for moderation / admin dashboard
 */
router.get("/admin/all", authenticate, getAllCommentsAdmin);

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
