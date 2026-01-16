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

  const res = await fetch(`${BASE_URL}/posts`);
  const posts = await res.json();

  const adminPosts = posts.filter(p => p.author.id === 3);

  postsSection.innerHTML = "";

  adminPosts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post-card";

    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>By ${post.author.username}</p>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Read";
    btn.className = "btn";
    btn.onclick = () => openModal(post.id);

    div.appendChild(btn);
    postsSection.appendChild(div);
  });
}

/* ---------------- LOGIN ---------------- */
loginBtn.addEventListener("click", async () => {
  loginMessage.textContent = "";

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
    loginMessage.textContent = data.message;
    return;
  }

  localStorage.setItem("jwt", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  JWT = data.token;

  showUserHome();
});

/* ---------------- LOGOUT ---------------- */
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  JWT = null;
  showPublicHome();
});

/* ---------------- INIT ---------------- */
(function init() {
  JWT ? showUserHome() : showPublicHome();
})();
