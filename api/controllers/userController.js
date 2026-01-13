// api/controllers/userController.js
import prisma from "../prisma/prisma.config.js";

/**
 * GET CURRENT USER
 * - Auth required
 * - Returns info about the logged-in user
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * GET USER BY ID
 * - Auth optional
 * - Returns public info only
 */
export const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * GET ALL USERS
 * - Auth required
 * - Returns list of users (public info only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};
