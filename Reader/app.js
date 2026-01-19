// Reader/app.js
import { BASE_URL, ADMIN_URL } from "./config.js";
import { openModal } from "./modal.js";

let JWT = localStorage.getItem("jwt");

/*DOM ELEMENTS*/
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
const toggleLoginPassword = document.getElementById("toggleLoginPassword");

/* Signup */
const signupBtn = document.getElementById("signup-btn");
const signupUsername = document.getElementById("signup-username");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupMessage = document.getElementById("signup-message");
const toggleSignupPassword = document.getElementById("toggleSignupPassword");

const goToSignupLink = document.getElementById("go-to-signup");
const goToLoginLink = document.getElementById("go-to-login");

/*VIEW HELPERS*/
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

/*NAVIGATION*/
homeLink.addEventListener("click", (e) => {
  e.preventDefault();
  JWT ? showUserHome() : showPublicHome();
});

loginNavBtn.addEventListener("click", showLogin);

profileBtn.addEventListener("click", () => {
  window.location.href = "./profile.html";
});

goToSignupLink.addEventListener("click", (e) => {
  e.preventDefault();
  hideAll();
  signupSection.hidden = false;
});

goToLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  showLogin();
});

/*PASSWORD TOGGLE*/
function togglePassword(input, icon) {
  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "visibility_off";
  } else {
    input.type = "password";
    icon.textContent = "visibility";
  }
}

toggleLoginPassword.addEventListener("click", () =>
  togglePassword(passwordInput, toggleLoginPassword)
);

toggleSignupPassword.addEventListener("click", () =>
  togglePassword(signupPassword, toggleSignupPassword)
);

/*POSTS*/
async function fetchPosts() {
  postsSection.innerHTML = "<p>Loading posts…</p>";

  try {
    const res = await fetch(`${BASE_URL}/posts`);
    let posts = [];

    if (res.ok) {
      posts = await res.json();

      // Only show Admin posts (Admin user id = 3)
      posts = posts.filter((post) => post.author?.id === 3);
    }

    postsSection.innerHTML = "";

    if (!posts.length) {
      postsSection.innerHTML = "<p>No articles available.</p>";
      return;
    }

    for (const post of posts) {
      let commentCount = 0;
      let uniqueCommenters = 0;

      // Get comment count for each post
      try {
        const cRes = await fetch(`${BASE_URL}/comments?postId=${post.id}`);
        if (cRes.ok) {
          const data = await cRes.json();

          // updated response format
          const comments = data.comments || [];
          commentCount = comments.length;
          uniqueCommenters = data.commentersCount || 0;
        }
      } catch {
        commentCount = 0;
        uniqueCommenters = 0;
      }

      const card = document.createElement("div");
      card.className = "post-card";

      card.innerHTML = `
        <h3>${post.title}</h3>
        <p class="post-meta">
          By ${post.author.username} •
          ${new Date(post.createdAt).toLocaleDateString()} •
          ${commentCount} comment${commentCount !== 1 ? "s" : ""} •
          ${uniqueCommenters} unique commenter${uniqueCommenters !== 1 ? "s" : ""}
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
  } catch {
    postsSection.innerHTML = "<p>Error loading posts.</p>";
  }
}

/*LOGIN*/
loginBtn.addEventListener("click", async () => {
  loginMessage.textContent = "";

  if (!usernameOrEmailInput.value || !passwordInput.value) {
    loginMessage.textContent = "Username/email and password are required";
    return;
  }

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

    // Save session
    localStorage.setItem("jwt", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
      })
    );

    JWT = data.token;

    // Redirect admin ONLY after login
    if (data.user.role === "ADMIN") {
      // ⚠️ IMPORTANT: Pass token to Admin site via URL
      window.location.href = `${ADMIN_URL}?token=${data.token}&user=${encodeURIComponent(
        JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
        })
      )}`;
    } else {
      showUserHome();
    }
  } catch {
    loginMessage.textContent = "Login failed. Try again.";
  }
});

/*SIGNUP*/
signupBtn.addEventListener("click", async () => {
  signupMessage.textContent = "";

  if (!signupUsername.value || !signupPassword.value) {
    signupMessage.textContent = "Username and password are required";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: signupUsername.value,
        email: signupEmail.value || null,
        password: signupPassword.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      signupMessage.textContent = data.message || "Signup failed";
      return;
    }

    signupMessage.style.color = "green";
    signupMessage.textContent = "Account created! You can now log in.";

    setTimeout(() => {
      showLogin();
    }, 1000);
  } catch {
    signupMessage.textContent = "Signup failed. Try again.";
  }
});

/*LOGOUT*/
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  JWT = null;
  showPublicHome();
});

/*INIT*/
(function init() {
  // If we arrived from Admin logout, clear storage
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("logout") === "1") {
    localStorage.clear();
  }

  JWT ? showUserHome() : showPublicHome();
})();
