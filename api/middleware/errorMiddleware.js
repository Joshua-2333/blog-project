// api/middleware/errorMiddleware.js
import path from "path";
import { fileURLToPath } from "url";

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 404 Not Found Middleware
export const notFound = (req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "../views/404.html"));
};

// 500 Internal Server Error Middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // logs the error to the console
  res.status(500).sendFile(path.join(__dirname, "../views/500.html"));
};
