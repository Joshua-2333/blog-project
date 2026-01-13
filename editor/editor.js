// editor/editor.js
const BASE_URL = "http://localhost:3000/api";

// DOM elements
const loginSection = document.getElementById("login-section");
const signupSection = document.getElementById("signup-section");
const editorSection = document.getElementById("editor-section");

// Login elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const usernameOrEmailInput = document.getElementById("usernameOrEmail");
const passwordInput = document.getElementById("password");
const toggleLoginPassword = document.getElementById("toggleLoginPassword");
const loginMessage = document.getElementById("login-message");

// Signup elements
const signupUsername = document.getElementById("signup-username");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const toggleSignupPassword = document.getElementById("toggleSignupPassword");
const signupBtn = document.getElementById("signup-btn");
const signupMessage = document.getElementById("signup-message");
const goToLoginLink = document.getElementById("go-to-login");
const goToSignupLink = document.getElementById("go-to-signup");

// Editor elements
const postTitleInput = document.getElementById("post-title");
const postContentInput = document.getElementById("post-content");
const postPublishedInput = document.getElementById("post-published");
const createBtn = document.getElementById("create-btn");
const updateBtn = document.getElementById("update-btn");
const editorMessage = document.getElementById("editor-message");

let JWT = localStorage.getItem("jwt") || null;
let currentPostId = null;

/* PASSWORD TOGGLE */
const setupPasswordToggle = (input, icon) => {
  if (!input || !icon) return;
  icon.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "visibility_off";
    } else {
      input.type = "password";
      icon.textContent = "visibility";
    }
  });
};
setupPasswordToggle(passwordInput, toggleLoginPassword);
setupPasswordToggle(signupPassword, toggleSignupPassword);

/* SHOW/HIDE SECTIONS */
const showLogin = () => {
  loginSection.style.display = "block";
  signupSection.style.display = "none";
  editorSection.style.display = "none";
};
const showSignup = () => {
  loginSection.style.display = "none";
  signupSection.style.display = "block";
  editorSection.style.display = "none";
};
const showEditor = () => {
  loginSection.style.display = "none";
  signupSection.style.display = "none";
  editorSection.style.display = "block";
};

/* SWITCH LINKS */
if (goToLoginLink) goToLoginLink.addEventListener("click", e => { e.preventDefault(); showLogin(); });
if (goToSignupLink) goToSignupLink.addEventListener("click", e => { e.preventDefault(); showSignup(); });

/* LOGIN */
loginBtn.addEventListener("click", async () => {
  const usernameOrEmail = usernameOrEmailInput.value.trim();
  const password = passwordInput.value.trim();
  loginMessage.textContent = "";

  if (!usernameOrEmail || !password) {
    loginMessage.textContent = "Please enter username/email and password";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const data = await res.json();
    if (res.ok) {
      JWT = data.token;
      localStorage.setItem("jwt", JWT);
      loginMessage.textContent = "Login successful!";
      showEditor();
    } else {
      loginMessage.textContent = data.message || "Login failed";
    }
  } catch (err) {
    loginMessage.textContent = "Error connecting to server";
    console.error(err);
  }
});

/* SIGNUP */
signupBtn.addEventListener("click", async () => {
  signupMessage.textContent = "";

  const username = signupUsername.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;

  if (username.length < 3) return signupMessage.textContent = "Username must be at least 3 characters";
  if (!email.includes("@")) return signupMessage.textContent = "Invalid email address";
  if (password.length < 6) return signupMessage.textContent = "Password must be at least 6 characters";

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Sign-up successful! Redirecting to login...");
      showLogin();
    } else {
      signupMessage.textContent = data.message || "Sign-up failed";
    }
  } catch (err) {
    signupMessage.textContent = "Error connecting to server";
    console.error(err);
  }
});

/* LOGOUT */
logoutBtn.addEventListener("click", () => {
  JWT = null;
  localStorage.removeItem("jwt");
  showLogin();
});

/* CREATE POST */
createBtn.addEventListener("click", async () => {
  const title = postTitleInput.value.trim();
  const content = postContentInput.value.trim();
  const published = postPublishedInput.checked;
  editorMessage.textContent = "";

  if (!title || !content) {
    editorMessage.textContent = "Title and content are required";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${JWT}` },
      body: JSON.stringify({ title, content, published }),
    });
    const data = await res.json();
    if (res.ok) {
      editorMessage.textContent = "Post created successfully!";
      currentPostId = data.id;
      createBtn.style.display = "none";
      updateBtn.style.display = "inline-block";
    } else {
      editorMessage.textContent = data.message || "Failed to create post";
    }
  } catch (err) {
    editorMessage.textContent = "Error connecting to server";
    console.error(err);
  }
});

/* UPDATE POST */
updateBtn.addEventListener("click", async () => {
  if (!currentPostId) return;

  const title = postTitleInput.value.trim();
  const content = postContentInput.value.trim();
  const published = postPublishedInput.checked;
  editorMessage.textContent = "";

  try {
    const res = await fetch(`${BASE_URL}/posts/${currentPostId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${JWT}` },
      body: JSON.stringify({ title, content, published }),
    });
    const data = await res.json();
    if (res.ok) {
      editorMessage.textContent = "Post updated successfully!";
    } else {
      editorMessage.textContent = data.message || "Failed to update post";
    }
  } catch (err) {
    editorMessage.textContent = "Error connecting to server";
    console.error(err);
  }
});

/* AUTO SHOW SECTION BASED ON JWT */
if (JWT) showEditor();
else showLogin();
