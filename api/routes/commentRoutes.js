// api/routes/commentRoutes.js
import express from "express";
import { getComments, addComment, deleteComment } from "../controllers/commentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route: get all comments (only for published posts)
router.get("/", getComments);

// Protected route: add a comment
router.post("/", authenticate, addComment);

// Protected route: delete a comment (author only)
router.delete("/:id", authenticate, deleteComment);

export default router;
