// api/middleware/errorMiddleware.js
import path from "path";
import { fileURLToPath } from "url";

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 404 Not Found Middleware
 * - Handles unknown routes
 * - Returns JSON for API
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} does not exist`,
  });
};

/**
 * 500 Internal Server Error Middleware
 * - Handles all other errors
 * - Logs the error stack
 * - Returns JSON for API
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // log error

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "Something went wrong",
  });
};
