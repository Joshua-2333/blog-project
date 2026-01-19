// Reader/config.js
export const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "https://blog-api-xkeo.onrender.com/api";

export const ADMIN_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5501"
    : "https://blog-project-admin.onrender.com";
