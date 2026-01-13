// api/routes/userRoutes.js
import express from "express";
import { getAllUsers, getUserById, getMe } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected: get list of all users
router.get("/", authenticate, getAllUsers);

// Protected: get info about the current logged-in user
router.get("/me", authenticate, getMe);

// Protected: get public info about a specific user
router.get("/:id", authenticate, getUserById);

export default router;
