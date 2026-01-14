// editor/editor.js
const BASE_URL = "http://localhost:3000/api";

/*DOM ELEMENTS*/
const loginSection = document.getElementById("login-section");
const signupSection = document.getElementById("signup-section");
const editorSection = document.getElementById("editor-section");

/* Login */
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const usernameOrEmailInput = document.getElementById("usernameOrEmail");
const passwordInput = document.getElementById("password");
const toggleLoginPassword = document.getElementById("toggleLoginPassword");
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

/* Editor */
const postTitleInput = document.getElementById("post-title");
const postContentInput = document.getElementById("post-content");
const postPublishedInput = document.getElementById("post-published");
const createBtn = document.getElementById("create-btn");
const updateBtn = document.getElementById("update-btn");
const editorMessage = document.getElementById("editor-message");

/*STATE*/
let JWT = localStorage.getItem("jwt");
let currentPostId = null;

/*HELPERS*/
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const setError = (input) => {
  input.classList.add("input-error");
  input.classList.remove("input-valid");
};

const setValid = (input) => {
  input.classList.remove("input-error");
  input.classList.add("input-valid");
};

/*PASSWORD TOGGLE*/
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

/*LIVE VALIDATION (SIGNUP)*/
signupUsername.addEventListener("input", () => {
  signupUsername.value.length < 3 ? setError(signupUsername) : setValid(signupUsername);
});

signupEmail.addEventListener("input", () => {
  isValidEmail(signupEmail.value) ? setValid(signupEmail) : setError(signupEmail);
});

signupPassword.addEventListener("input", () => {
  signupPassword.value.length < 6 ? setError(signupPassword) : setValid(signupPassword);
});

/*LIVE VALIDATION (LOGIN)*/
const validateLoginUsernameOrEmail = () => {
  const val = usernameOrEmailInput.value.trim();
  if (val.includes("@")) {
    // treat as email
    if (isValidEmail(val)) {
      setValid(usernameOrEmailInput);
      return true;
    } else {
      setError(usernameOrEmailInput);
      return false;
    }
  } else {
    // treat as username
    if (val.length >= 3) {
      setValid(usernameOrEmailInput);
      return true;
    } else {
      setError(usernameOrEmailInput);
      return false;
    }
  }
};

usernameOrEmailInput.addEventListener("input", validateLoginUsernameOrEmail);

passwordInput.addEventListener("input", () => {
  passwordInput.value.length >= 6 ? setValid(passwordInput) : setError(passwordInput);
});

/*SECTION VISIBILITY*/
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

/*NAV LINKS*/
goToSignupLink.addEventListener("click", (e) => {
  e.preventDefault();
  showSignup();
});

goToLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  showLogin();
});

/*LOGIN (ALL ERRORS)*/
loginBtn.addEventListener("click", async () => {
  loginMessage.innerHTML = "";
  const usernameOrEmail = usernameOrEmailInput.value.trim();
  const password = passwordInput.value;
  const errors = [];

  // Validate username/email
  if (!validateLoginUsernameOrEmail()) {
    errors.push("Invalid username or email");
  }

  // Validate password
  if (!password || password.length < 6) {
    setError(passwordInput);
    errors.push("Password must be at least 6 characters");
  } else {
    setValid(passwordInput);
  }

  if (errors.length > 0) {
    loginMessage.innerHTML = errors.join("<br>");
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
      showEditor();
    } else {
      loginMessage.innerHTML = "Invalid username/email or password";
      setError(usernameOrEmailInput);
      setError(passwordInput);
    }
  } catch {
    loginMessage.textContent = "Server error";
  }
});

/*SIGNUP (ALL ERRORS)*/
signupBtn.addEventListener("click", async () => {
  signupMessage.textContent = "";

  const username = signupUsername.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;

  const errors = [];

  // Username validation
  if (username.length < 3) {
    errors.push("Username must be at least 3 characters");
    setError(signupUsername);
  } else {
    setValid(signupUsername);
  }

  // Email validation
  if (!isValidEmail(email)) {
    errors.push("Email must be in the format name@domain.com");
    setError(signupEmail);
  } else {
    setValid(signupEmail);
  }

  // Password validation
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
    setError(signupPassword);
  } else {
    setValid(signupPassword);
  }

  // Show all errors if any
  if (errors.length > 0) {
    signupMessage.innerHTML = errors.join("<br>");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Sign-up successful! Please log in.");
      showLogin();
    } else {
      signupMessage.textContent = data.message || "Sign-up failed";
    }
  } catch {
    signupMessage.textContent = "Server error";
  }
});

/*LOGOUT*/
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("jwt");
  JWT = null;
  showLogin();
});

/*INITIAL VIEW*/
JWT ? showEditor() : showLogin();
