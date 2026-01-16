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
const logoutBtn = document.getElementById("logout-btn");
const profileBtn = document.getElementById("profile-btn");

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

/* ---------------- VIEW HELPERS ---------------- */
const hideViews = () => {
  loginSection.hidden = true;
  signupSection.hidden = true;
  editorSection.hidden = true;
  homeSection.hidden = true;
};

const showLogin = () => {
  hideViews();
  loginSection.hidden = false;
  hideNav();
};

const showSignup = () => {
  hideViews();
  signupSection.hidden = false;
  hideNav();
};

const showHome = () => {
  hideViews();
  homeSection.hidden = false;
  showNav();
};

/* ---------------- NAV HELPERS ---------------- */
const showNav = () => {
  homeLink.hidden = false;
  logoutBtn.hidden = false;
  if (profileBtn) profileBtn.hidden = false;
};

const hideNav = () => {
  homeLink.hidden = true;
  logoutBtn.hidden = true;
  if (profileBtn) profileBtn.hidden = true;
};

/* ---------------- PASSWORD TOGGLE ---------------- */
const setupPasswordToggle = (input, icon) => {
  if (!icon) return;
  icon.addEventListener("click", () => {
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    icon.textContent = hidden ? "visibility_off" : "visibility";
  });
};

setupPasswordToggle(passwordInput, toggleLoginPassword);
setupPasswordToggle(signupPassword, toggleSignupPassword);

/* ---------------- NAV EVENTS ---------------- */
homeLink.addEventListener("click", e => {
  e.preventDefault();
  showHome();
  fetchPosts();
});

profileBtn?.addEventListener("click", e => {
  e.preventDefault();
  window.location.href = "./profile.html";
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
  postsSection.innerHTML = "<p>Loading posts…</p>";

  try {
    const res = await fetch(`${BASE_URL}/posts`);
    const posts = await res.json();

    const adminPosts = posts.filter(p => p.author.id === 3);

    if (!adminPosts.length) {
      postsSection.innerHTML = "<p>No posts from the admin yet.</p>";
      return;
    }

    postsSection.innerHTML = "";

    adminPosts.forEach(post => {
      const div = document.createElement("div");
      div.className = "post-card";

      div.innerHTML = `
        <h3>${post.title}</h3>
        <p class="post-meta">
          By ${post.author.username} | ${new Date(post.createdAt).toLocaleDateString()}
        </p>
      `;

      const btn = document.createElement("button");
      btn.textContent = "Read";
      btn.className = "btn";
      btn.addEventListener("click", () => openModal(post.id));

      div.appendChild(btn);
      postsSection.appendChild(div);
    });
  } catch {
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

    if (data.user.role === "ADMIN") {
      window.location.href = "../Admin/admin.html";
      return;
    }

    showHome();
    fetchPosts();
  } catch {
    loginMessage.textContent = "Network error";
  }
});

/* ---------------- LOGOUT ---------------- */
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  JWT = null;
  window.location.href = "./index.html";
});

/* ---------------- INIT ---------------- */
(function init() {
  if (!JWT) {
    showLogin();
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.role === "ADMIN") {
    window.location.href = "../Admin/admin.html";
    return;
  }

  showHome();
  fetchPosts();
})();
