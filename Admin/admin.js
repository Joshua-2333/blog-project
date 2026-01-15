//Admin/admin.js
const BASE_URL = "http://localhost:3000/api";
let JWT = localStorage.getItem("jwt");

const logoutBtn = document.getElementById("logout-btn");
const postTitleInput = document.getElementById("post-title");
const postContentInput = document.getElementById("post-content");
const postPublishedInput = document.getElementById("post-published");
const createBtn = document.getElementById("create-btn");
const editorMessage = document.getElementById("editor-message");

const postsList = document.getElementById("posts-list");
const loadingPosts = document.getElementById("loading-posts");

// ---------------- LOGOUT ----------------
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
  window.location.href = "/Reader/index.html";
});

// ---------------- CREATE POST ----------------
createBtn.addEventListener("click", async () => {
  if (!postTitleInput.value.trim() || !postContentInput.value.trim()) {
    editorMessage.textContent = "Title and content required";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify({
        title: postTitleInput.value.trim(),
        content: postContentInput.value.trim(),
        published: postPublishedInput.checked,
      }),
    });

    if (!res.ok) throw new Error("Failed to create post");

    postTitleInput.value = "";
    postContentInput.value = "";
    postPublishedInput.checked = false;

    fetchPosts();
  } catch (err) {
    editorMessage.textContent = err.message;
  }
});

// ---------------- FETCH POSTS ----------------
async function fetchPosts() {
  postsList.innerHTML = "";
  loadingPosts.hidden = false;

  try {
    const res = await fetch(`${BASE_URL}/posts?mine=true`, {
      headers: { Authorization: `Bearer ${JWT}` },
    });

    const posts = await res.json();
    loadingPosts.hidden = true;

    if (!posts.length) {
      postsList.innerHTML = "<p>No posts yet.</p>";
      return;
    }

    posts.forEach((post) => {
      const div = document.createElement("div");
      div.className = "post-card";
      div.innerHTML = `
        <h3>
          ${post.title}
          ${!post.published ? "<span class='draft'>Draft</span>" : ""}
        </h3>
        <p>Status: ${post.published ? "Published" : "Draft"}</p>
        <button class="toggle-publish-btn" data-id="${post.id}">
          ${post.published ? "Unpublish" : "Publish"}
        </button>
        <button class="delete-btn" data-id="${post.id}">Delete</button>
      `;
      postsList.appendChild(div);
    });

    setupPostButtons();
  } catch {
    loadingPosts.hidden = true;
    postsList.innerHTML = "<p>Error loading posts</p>";
  }
}

// ---------------- POST ACTIONS ----------------
function setupPostButtons() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;

      await fetch(`${BASE_URL}/posts/${btn.dataset.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${JWT}` },
      });

      fetchPosts();
    });
  });

  document.querySelectorAll(".toggle-publish-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const post = await fetch(`${BASE_URL}/posts/${id}`).then((r) => r.json());

      await fetch(`${BASE_URL}/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT}`,
        },
        body: JSON.stringify({ published: !post.published }),
      });

      fetchPosts();
    });
  });
}

// ---------------- INIT ----------------
function init() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!JWT || user.role !== "ADMIN") {
    alert("Admins only");
    window.location.href = "/Reader/index.html";
    return;
  }

  fetchPosts();
}

init();
