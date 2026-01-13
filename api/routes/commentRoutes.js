// api/routes/commentRoutes.js
import express from "express";
import { getComments, addComment, deleteComment } from "../controllers/commentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: get all comments
router.get("/", getComments);

// Private: add a comment
router.post("/", authenticate, addComment);

// Private: delete a comment (only author)
router.delete("/:id", authenticate, deleteComment);

export default router;
