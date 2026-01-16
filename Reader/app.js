// Reader/app.js
import { openModal } from "./modal.js";

const BASE_URL = "http://localhost:3000/api";
let JWT = localStorage.getItem("jwt");

/* ---------------- DOM ---------------- */
const homeSection = document.getElementById("home-section");
const loginSection = document.getElementById("login-section");
const signupSection = document.getElementById("signup-section");

const homeLink = document.getElementById("home-link");
const loginNavBtn = document.getElementById("login-nav-btn");
const logoutBtn = document.getElementById("logout-btn");
const profileBtn = document.getElementById("profile-btn");

const postsSection = document.getElementById("posts-section");

/* Login */
const loginBtn = document.getElementById("login-btn");
const usernameOrEmailInput = document.getElementById("usernameOrEmail");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("login-message");

/* Signup */
const signupBtn = document.getElementById("signup-btn");
const signupUsername = document.getElementById("signup-username");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupMessage = document.getElementById("signup-message");

const goToSignupLink = document.getElementById("go-to-signup");
const goToLoginLink = document.getElementById("go-to-login");

/* ---------------- VIEW HELPERS ---------------- */
const hideAll = () => {
  homeSection.hidden = true;
  loginSection.hidden = true;
  signupSection.hidden = true;

  homeLink.hidden = true;
  loginNavBtn.hidden = true;
  logoutBtn.hidden = true;
  profileBtn.hidden = true;
};

const showPublicHome = () => {
  hideAll();
  homeSection.hidden = false;
  homeLink.hidden = false;
  loginNavBtn.hidden = false;
  fetchPosts();
};

const showUserHome = () => {
  hideAll();
  homeSection.hidden = false;
  homeLink.hidden = false;
  logoutBtn.hidden = false;
  profileBtn.hidden = false;
  fetchPosts();
};

const showLogin = () => {
  hideAll();
  loginSection.hidden = false;
};

/* ---------------- NAV ---------------- */
homeLink.addEventListener("click", e => {
  e.preventDefault();
  JWT ? showUserHome() : showPublicHome();
});

loginNavBtn.addEventListener("click", showLogin);

profileBtn.addEventListener("click", () => {
  window.location.href = "./profile.html";
});

goToSignupLink.addEventListener("click", e => {
  e.preventDefault();
  hideAll();
  signupSection.hidden = false;
});

goToLoginLink.addEventListener("click", e => {
  e.preventDefault();
  showLogin();
});

/* ---------------- POSTS ---------------- */
async function fetchPosts() {
  postsSection.innerHTML = "<p>Loading posts…</p>";

  try {
    const res = await fetch(`${BASE_URL}/posts`);
    let posts = [];

    if (res.ok) {
      posts = await res.json();
      // Only keep Admin posts (id = 3)
      posts = posts.filter(post => post.author?.id === 3);
    }

    postsSection.innerHTML = "";

    if (!posts.length) {
      postsSection.innerHTML = "<p>No articles available.</p>";
      return;
    }

    for (const post of posts) {
      // Fetch comment count for this post
      let commentCount = 0;
      try {
        const cRes = await fetch(`${BASE_URL}/comments?postId=${post.id}`);
        if (cRes.ok) {
          const comments = await cRes.json();
          commentCount = comments.length;
        }
      } catch {}

      const card = document.createElement("div");
      card.className = "post-card";

      card.innerHTML = `
        <h3>${post.title}</h3>
        <p class="post-meta">
          By ${post.author.username} • 
          ${new Date(post.createdAt).toLocaleDateString()} •
          ${commentCount} comment${commentCount !== 1 ? "s" : ""}
        </p>
        <p>${post.content.slice(0, 160)}...</p>
      `;

      const btn = document.createElement("button");
      btn.textContent = "Read Article";
      btn.className = "btn";
      btn.onclick = () => openModal(post.id);

      card.appendChild(btn);
      postsSection.appendChild(card);
    }

  } catch (err) {
    postsSection.innerHTML = "<p>Error loading posts.</p>";
  }
}

/* ---------------- LOGIN ---------------- */
loginBtn.addEventListener("click", async () => {
  loginMessage.textContent = "";

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernameOrEmail: usernameOrEmailInput.value,
        password: passwordInput.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      loginMessage.textContent = data.message || "Login failed";
      return;
    }

    // Store JWT and user object
    localStorage.setItem("jwt", data.token);
    localStorage.setItem("user", JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      role: data.user.role
    }));
    JWT = data.token;

    // Redirect based on role
    if (data.user.role === "ADMIN") {
      window.location.href = "/Admin/admin.html";
    } else {
      showUserHome();
    }

  } catch {
    loginMessage.textContent = "Login failed. Try again.";
  }
});

/* ---------------- LOGOUT ---------------- */
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  JWT = null;
  showPublicHome();
});

/* ---------------- INIT ---------------- */
(function init() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (JWT && user.role === "ADMIN") {
    window.location.href = "/Admin/admin.html";
  } else {
    JWT ? showUserHome() : showPublicHome();
  }
})();
