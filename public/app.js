// public/app.js
import { openModal, closeModal } from "./modal.js";

const BASE_URL = "http://localhost:3000/api";
let JWT = localStorage.getItem("jwt");

/* ---------------- DOM ELEMENTS ---------------- */
const loginSection = document.getElementById("login-section");
const signupSection = document.getElementById("signup-section");
const editorSection = document.getElementById("editor-section");
const homeSection = document.getElementById("home-section");

const usernameOrEmailInput = document.getElementById("usernameOrEmail");
const passwordInput = document.getElementById("password");
const toggleLoginPassword = document.getElementById("toggleLoginPassword");
const loginBtn = document.getElementById("login-btn");
const loginMessage = document.getElementById("login-message");

const signupUsername = document.getElementById("signup-username");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const toggleSignupPassword = document.getElementById("toggleSignupPassword");
const signupBtn = document.getElementById("signup-btn");
const signupMessage = document.getElementById("signup-message");

const goToLoginLink = document.getElementById("go-to-login");
const goToSignupLink = document.getElementById("go-to-signup");

const createPostLink = document.getElementById("create-post-link");
const homeLink = document.getElementById("home-link");
const postTitleInput = document.getElementById("post-title");
const postContentInput = document.getElementById("post-content");
const postPublishedInput = document.getElementById("post-published");
const createBtn = document.getElementById("create-btn");
const logoutBtn = document.getElementById("logout-btn");
const editorMessage = document.getElementById("editor-message");

const postsSection = document.getElementById("posts-section");
const loadingPosts = document.getElementById("loading-posts");

const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const modalMeta = document.getElementById("modal-meta");
const commentsSection = document.getElementById("comments-section");
const commentInput = document.getElementById("comment-input");
const submitCommentBtn = document.getElementById("submit-comment");
const commentMessage = document.getElementById("comment-message");
const commentForm = document.getElementById("comment-form");
const loginRequired = document.getElementById("login-required");

let currentPostId = null;

/* ---------------- SECTION VISIBILITY ---------------- */
const showLogin = () => {
  loginSection.style.display = "block";
  signupSection.style.display = "none";
  editorSection.style.display = "none";
  homeSection.style.display = "none";
  homeLink.hidden = true;
};
const showSignup = () => {
  loginSection.style.display = "none";
  signupSection.style.display = "block";
  editorSection.style.display = "none";
  homeSection.style.display = "none";
  homeLink.hidden = true;
};
const showEditor = () => {
  loginSection.style.display = "none";
  signupSection.style.display = "none";
  editorSection.style.display = "block";
  homeSection.style.display = "block";
  homeLink.hidden = false;
};

/* ---------------- PASSWORD TOGGLE ---------------- */
const setupPasswordToggle = (input, icon) => {
  if (!input || !icon) return;
  icon.addEventListener("click", () => {
    input.type = input.type === "password" ? "text" : "password";
    icon.textContent = input.type === "password" ? "visibility" : "visibility_off";
  });
  icon.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      input.type = input.type === "password" ? "text" : "password";
      icon.textContent = input.type === "password" ? "visibility" : "visibility_off";
    }
  });
};
setupPasswordToggle(passwordInput, toggleLoginPassword);
setupPasswordToggle(signupPassword, toggleSignupPassword);

/* ---------------- NAV LINKS ---------------- */
goToSignupLink.addEventListener("click", e => { e.preventDefault(); showSignup(); });
goToLoginLink.addEventListener("click", e => { e.preventDefault(); showLogin(); });

/* ---------------- VALIDATION ---------------- */
const validateLogin = () => {
  let valid = true;
  loginMessage.textContent = "";
  usernameOrEmailInput.classList.remove("invalid");
  passwordInput.classList.remove("invalid");

  const errors = [];
  if (!usernameOrEmailInput.value.trim()) {
    valid = false;
    usernameOrEmailInput.classList.add("invalid");
    errors.push("Username or email required");
  }
  if (!passwordInput.value) {
    valid = false;
    passwordInput.classList.add("invalid");
    errors.push("Password required");
  }

  loginMessage.textContent = errors.join(" • ");
  return valid;
};

const validateSignup = () => {
  let valid = true;
  signupMessage.textContent = "";
  signupUsername.classList.remove("invalid");
  signupEmail.classList.remove("invalid");
  signupPassword.classList.remove("invalid");

  const errors = [];
  if (signupUsername.value.trim().length < 3) {
    valid = false;
    signupUsername.classList.add("invalid");
    errors.push("Username min 3 characters");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.value.trim())) {
    valid = false;
    signupEmail.classList.add("invalid");
    errors.push("Invalid email");
  }
  if (signupPassword.value.length < 6) {
    valid = false;
    signupPassword.classList.add("invalid");
    errors.push("Password min 6 characters");
  }

  signupMessage.textContent = errors.join(" • ");
  return valid;
};

/* ---------------- LOGIN ---------------- */
loginBtn.addEventListener("click", async () => {
  if (!validateLogin()) return;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernameOrEmail: usernameOrEmailInput.value.trim(),
        password: passwordInput.value
      })
    });
    const data = await res.json();
    if (!res.ok) { loginMessage.textContent = data.message || "Login failed"; return; }
    JWT = data.token;
    localStorage.setItem("jwt", JWT);
    createPostLink.hidden = false;
    showEditor();
    fetchPosts();
  } catch { loginMessage.textContent = "Network error"; }
});

/* ---------------- SIGNUP ---------------- */
signupBtn.addEventListener("click", async () => {
  if (!validateSignup()) return;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: signupUsername.value.trim(),
        email: signupEmail.value.trim(),
        password: signupPassword.value
      })
    });
    const data = await res.json();
    if (!res.ok) { signupMessage.textContent = data.message || "Signup failed"; return; }
    alert("Sign-up successful! Please log in.");
    showLogin();
  } catch { signupMessage.textContent = "Network error"; }
});

/* ---------------- LOGOUT ---------------- */
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("jwt");
  JWT = null;
  createPostLink.hidden = true;
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
    if (!posts.length) { postsSection.innerHTML = "<p>No posts yet.</p>"; return; }
    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "post-card";
      card.dataset.id = post.id;
      card.tabIndex = 0;
      card.innerHTML = `<h3>${post.title}</h3>
        <p class="post-meta">By ${post.author} • ${new Date(post.createdAt).toLocaleDateString()}</p>
        <p class="post-preview">${post.content.slice(0,200)}${post.content.length>200?"...":""}</p>`;
      postsSection.appendChild(card);
    });
  } catch { loadingPosts.hidden = true; postsSection.innerHTML = "<p>Error loading posts</p>"; }
}

/* ---------------- OPEN POST MODAL ---------------- */
async function openPost(id) {
  currentPostId = id;
  commentInput.value = "";
  commentMessage.textContent = "";
  try {
    const res = await fetch(`${BASE_URL}/posts/${id}`);
    const post = await res.json();
    modalTitle.textContent = post.title;
    modalContent.textContent = post.content;
    modalMeta.textContent = `By ${post.author} • ${new Date(post.createdAt).toLocaleDateString()}`;
    commentsSection.innerHTML = "";
    if (post.comments?.length) {
      post.comments.forEach(c => {
        const div = document.createElement("div");
        div.className = "comment";
        div.textContent = c.content;
        commentsSection.appendChild(div);
      });
    } else commentsSection.innerHTML = "<p>No comments yet.</p>";
    if (JWT) { commentForm.hidden = false; loginRequired.hidden = true; }
    else { commentForm.hidden = true; loginRequired.hidden = false; }
    openModal();
  } catch { alert("Failed to load post"); }
}

/* ---------------- SUBMIT COMMENT ---------------- */
submitCommentBtn.addEventListener("click", async () => {
  const content = commentInput.value.trim();
  if (!content) return;
  try {
    const res = await fetch(`${BASE_URL}/posts/${currentPostId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${JWT}` },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error();
    const div = document.createElement("div");
    div.className = "comment";
    div.textContent = content;
    commentsSection.appendChild(div);
    commentInput.value = "";
  } catch { commentMessage.textContent = "Failed to post comment"; }
});

/* ---------------- CREATE POST ---------------- */
createBtn.addEventListener("click", async () => {
  editorMessage.textContent = "";
  const title = postTitleInput.value.trim();
  const content = postContentInput.value.trim();
  const published = postPublishedInput.checked;
  if (title.length < 3 || content.length < 10) {
    editorMessage.textContent = "Title min 3 chars • Content min 10 chars";
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${JWT}` },
      body: JSON.stringify({ title, content, published })
    });
    if (!res.ok) throw new Error();
    editorMessage.textContent = "Post created successfully!";
    postTitleInput.value = "";
    postContentInput.value = "";
    postPublishedInput.checked = false;
    fetchPosts();
  } catch { editorMessage.textContent = "Failed to save post"; }
});

/* ---------------- POST CARD CLICK ---------------- */
postsSection.addEventListener("click", e => {
  const card = e.target.closest(".post-card");
  if (card) openPost(card.dataset.id);
});
postsSection.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const card = e.target.closest(".post-card");
  if (card) openPost(card.dataset.id);
});

/* ---------------- INITIAL VIEW ---------------- */
if (JWT) { createPostLink.hidden = false; showEditor(); fetchPosts(); }
else showLogin();
