// api/routes/commentRoutes.js
import express from "express";
import { getComments, addComment, deleteComment } from "../controllers/commentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", authenticate, addComment);
router.delete("/:id", authenticate, deleteComment);

export default router;sssss
