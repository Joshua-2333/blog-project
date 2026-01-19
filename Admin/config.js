// Admin/config.js
export const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "https://blog-api-xkeo.onrender.com/api";

export const READER_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5500/Reader/"
    : "https://blog-project-reader.onrender.com/";
