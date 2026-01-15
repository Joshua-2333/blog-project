// Reader/app.js
import { openModal } from "./modal.js";

const BASE_URL = "http://localhost:3000/api";
let JWT = localStorage.getItem("jwt");

/* ---------------- DOM ---------------- */
const loginSection = document.getElementById("login-section");
const signupSection = document.getElementById("signup-section");
const editorSection = document.getElementById("editor-section");
const homeSection = document.getElementById("home-section");

const homeLink = document.getElementById("home-link");
const createPostLink = document.getElementById("create-post-link");
const logoutBtn = document.getElementById("logout-btn");

/* Login */
const usernameOrEmailInput = document.getElementById("usernameOrEmail");
const passwordInput = document.getElementById("password");
const toggleLoginPassword = document.getElementById("toggleLoginPassword");
const loginBtn = document.getElementById("login-btn");
const loginMessage = document.getElementById("login-message");

/* Signup */
const signupUsername = document.getElementById("signup-username");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const toggleSignupPassword = document.getElementById("toggleSignupPassword");
const signupBtn = document.getElementById("signup-btn");
const signupMessage = document.getElementById("signup-message");

const goToLoginLink = document.getElementById("go-to-login");
const goToSignupLink = document.getElementById("go-to-signup");

/* Posts */
const postsSection = document.getElementById("posts-section");
const loadingPosts = document.getElementById("loading-posts");

/* ---------------- VIEW HELPERS ---------------- */
const hideAll = () => {
  loginSection.hidden = true;
  signupSection.hidden = true;
  editorSection.hidden = true;
  homeSection.hidden = true;
  logoutBtn.hidden = true;
  homeLink.hidden = true;
};

const showLogin = () => {
  hideAll();
  loginSection.hidden = false;
};

const showSignup = () => {
  hideAll();
  signupSection.hidden = false;
};

const showHome = () => {
  hideAll();
  homeSection.hidden = false;
  homeLink.hidden = false;
  logoutBtn.hidden = false;
};

const showEditor = () => {
  hideAll();
  editorSection.hidden = false;
  homeLink.hidden = false;
  logoutBtn.hidden = false;
};

/* ---------------- PASSWORD TOGGLE ---------------- */
const setupPasswordToggle = (input, icon) => {
  const toggle = () => {
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    icon.textContent = hidden ? "visibility_off" : "visibility";
  };
  icon.addEventListener("click", toggle);
  icon.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
};
setupPasswordToggle(passwordInput, toggleLoginPassword);
setupPasswordToggle(signupPassword, toggleSignupPassword);

/* ---------------- NAV ---------------- */
homeLink.addEventListener("click", e => {
  e.preventDefault();
  showHome();
  fetchPosts();
});

goToSignupLink.addEventListener("click", e => {
  e.preventDefault();
  showSignup();
});

goToLoginLink.addEventListener("click", e => {
  e.preventDefault();
  showLogin();
});

/* ---------------- FETCH POSTS ---------------- */
async function fetchPosts() {
  postsSection.innerHTML = "";
  loadingPosts.hidden = false;

  try {
    const res = await fetch(`${BASE_URL}/posts`);
    const posts = await res.json();
    loadingPosts.hidden = true;

    if (!posts.length) {
      postsSection.innerHTML = "<p>No posts yet.</p>";
      return;
    }

    posts.forEach(post => {
      const div = document.createElement("div");
      div.className = "post-card";
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p class="post-meta">By ${post.author.username}</p>
        <button class="btn read-btn">Read</button>
      `;
      div.querySelector(".read-btn").addEventListener("click", () => {
        openModal(post.id);
      });
      postsSection.appendChild(div);
    });
  } catch {
    loadingPosts.hidden = true;
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
        usernameOrEmail: usernameOrEmailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      loginMessage.textContent = data.message || "Login failed";
      return;
    }

    localStorage.setItem("jwt", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    JWT = data.token;

    logoutBtn.hidden = false;

    // Redirect based on role
    if (data.user.role === "ADMIN") {
      window.location.href = "../Admin/admin.html"; // relative to Reader
      return;
    }

    showHome();
    fetchPosts();
  } catch {
    loginMessage.textContent = "Network error";
  }
});

/* ---------------- SIGNUP ---------------- */
signupBtn.addEventListener("click", async () => {
  signupMessage.textContent = "";

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: signupUsername.value.trim(),
        email: signupEmail.value.trim(),
        password: signupPassword.value,
      }),
    });

    if (!res.ok) {
      signupMessage.textContent = "Signup failed";
      return;
    }

    alert("Account created. Please log in.");
    showLogin();
  } catch {
    signupMessage.textContent = "Signup failed";
  }
});

/* ---------------- LOGOUT ---------------- */
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  JWT = null;
  window.location.href = "../Reader/index.html"; // go back to login page
});

/* ---------------- INIT ---------------- */
(function init() {
  if (!JWT) {
    showLogin();
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  logoutBtn.hidden = false;

  if (user?.role === "ADMIN") {
    window.location.href = "../Admin/admin.html"; // relative to Reader
    return;
  }

  showHome();
  fetchPosts();
})();
