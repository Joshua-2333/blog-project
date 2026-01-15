const BASE_URL = "http://localhost:3000/api";
const JWT = localStorage.getItem("jwt");
const user = JSON.parse(localStorage.getItem("user") || "{}");

/* ---------------- AUTH GUARD ---------------- */
if (!JWT || user.role !== "ADMIN") {
  alert("Admins only");
  window.location.href = "/Reader/index.html";
}

/* ---------------- DOM ---------------- */
const logoutBtn = document.getElementById("logout-btn");
const newPostBtn = document.getElementById("new-post-btn");
const postsList = document.getElementById("posts-list");
const loadingPosts = document.getElementById("loading-posts");

/* ---------------- LOGOUT ---------------- */
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/Reader/index.html";
});

/* ---------------- NAV ---------------- */
newPostBtn.addEventListener("click", () => {
  window.location.href = "new-post.html";
});

/* ---------------- FETCH POSTS ---------------- */
async function fetchPosts() {
  postsList.innerHTML = "";
  loadingPosts.hidden = false;

  try {
    const res = await fetch(`${BASE_URL}/posts?mine=true`, {
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
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

        <div class="post-actions">
          <button class="toggle-btn" data-id="${post.id}">
            ${post.published ? "Unpublish" : "Publish"}
          </button>
          <button class="delete-btn" data-id="${post.id}">
            Delete
          </button>
        </div>
      `;

      postsList.appendChild(div);
    });

    setupButtons();
  } catch {
    loadingPosts.hidden = true;
    postsList.innerHTML = "<p>Error loading posts.</p>";
  }
}

/* ---------------- POST ACTIONS ---------------- */
function setupButtons() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;

      await fetch(`${BASE_URL}/posts/${btn.dataset.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      });

      fetchPosts();
    });
  });

  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const post = await fetch(`${BASE_URL}/posts/${id}`).then((r) =>
        r.json()
      );

      await fetch(`${BASE_URL}/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT}`,
        },
        body: JSON.stringify({
          published: !post.published,
        }),
      });

      fetchPosts();
    });
  });
}

/* ---------------- INIT ---------------- */
fetchPosts();
