// Admin/config.js
export const BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "::1"
    ? "http://localhost:3000/api"
    : "https://blog-api-xkeo.onrender.com/api";
