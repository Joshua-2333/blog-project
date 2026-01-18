// Reader/profile.js
import { BASE_URL } from "./config.js";

const usernameEl = document.getElementById("profile-username");
const emailEl = document.getElementById("profile-email");
const commentsList = document.getElementById("comments-list");
const logoutBtn = document.getElementById("logout-btn");
const homeLink = document.getElementById("home-link");

const JWT = localStorage.getItem("jwt");
const user = JSON.parse(localStorage.getItem("user"));

if (!JWT || !user) {
  window.location.href = "./index.html";
}

usernameEl.textContent = user.username;
emailEl.textContent = user.email || "No email saved";

async function loadComments() {
  commentsList.innerHTML = "Loading comments...";
  try {
    const res = await fetch(`${BASE_URL}/comments/user/${user.id}`, {
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to load comments");
    }

    const comments = await res.json(); // <-- returns array

    if (!comments.length) {
      commentsList.innerHTML = "<p>No comments yet.</p>";
      return;
    }

    commentsList.innerHTML = "";
    comments.forEach((c) => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <strong>On post:</strong> ${c.post.title} <br> 
        ${c.content}
      `;
      commentsList.appendChild(div);
    });
  } catch {
    commentsList.innerHTML = "<p>Error loading comments.</p>";
  }
}

loadComments();

homeLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "./index.html";
});

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "./index.html";
});
