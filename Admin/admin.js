// Admin/admin.js
import { BASE_URL } from "./config.js";

const JWT = localStorage.getItem("jwt");
const user = JSON.parse(localStorage.getItem("user") || "{}");

/*AUTH GUARD*/
if (!JWT || user.role !== "ADMIN") {
  alert("Admins only");
  window.location.href = "/Reader/index.html";
}

/*DOM*/
const logoutBtn = document.getElementById("logout-btn");
const newPostBtn = document.getElementById("new-post-btn");
const postsList = document.getElementById("posts-list");
const loadingPosts = document.getElementById("loading-posts");

/*LOGOUT */
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/Reader/index.html";
});

/*NAV*/
newPostBtn.addEventListener("click", () => {
  window.location.href = "new-post.html";
});

/*FETCH POSTS*/
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

      const imageHTML = post.imageUrl
        ? `<img src="${post.imageUrl}" alt="Image for ${post.title}" class="post-image">`
        : "";

      div.innerHTML = `
        ${imageHTML}
        <h3>
          ${post.title} ${!post.published ? "<span class='draft'>Draft</span>" : ""}
        </h3>
        <p>Status: ${post.published ? "Published" : "Draft"}</p>

        <div class="post-actions">
          <button class="toggle-btn" data-id="${post.id}">
            ${post.published ? "Unpublish" : "Publish"}
          </button>
          <button class="delete-btn" data-id="${post.id}">
            Delete
          </button>
          <button class="view-comments-btn" data-id="${post.id}">
            View Comments
          </button>
        </div>

        <div class="comments-container" id="comments-${post.id}" style="display:none; margin-top:1rem; padding-left:1rem;"></div>
      `;

      postsList.appendChild(div);
    });

    setupButtons();
  } catch {
    loadingPosts.hidden = true;
    postsList.innerHTML = "<p>Error loading posts.</p>";
  }
}

/*POST ACTIONS*/
function setupButtons() {
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

  document.querySelectorAll(".toggle-btn").forEach((btn) => {
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

  document.querySelectorAll(".view-comments-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const postId = btn.dataset.id;
      const container = document.getElementById(`comments-${postId}`);
      container.style.display = container.style.display === "none" ? "block" : "none";

      if (container.innerHTML === "") {
        try {
          const res = await fetch(`${BASE_URL}/comments?postId=${postId}`, {
            headers: { Authorization: `Bearer ${JWT}` },
          });
          const comments = await res.json();

          if (!comments.length) {
            container.innerHTML = "<p>No comments yet.</p>";
            return;
          }

          comments.forEach((c) => {
            const div = document.createElement("div");
            div.className = "comment";
            div.style.marginBottom = "0.5rem";
            div.innerHTML = `
              <p><strong>${c.user.username}</strong>: ${c.content}</p>
              <div style="margin-left:1rem;">
                <textarea class="reply-input" placeholder="Reply..."></textarea>
                <button class="reply-btn" data-comment-id="${c.id}">Reply</button>
                <div class="replies"></div>
              </div>
            `;
            container.appendChild(div);

            if (c.replies?.length) {
              const repliesDiv = div.querySelector(".replies");
              c.replies.forEach((r) => {
                const rDiv = document.createElement("div");
                rDiv.style.marginLeft = "1rem";
                rDiv.innerHTML = `<strong>${r.user.username}</strong>: ${r.content}`;
                repliesDiv.appendChild(rDiv);
              });
            }
          });

          container.querySelectorAll(".reply-btn").forEach((rbtn) => {
            rbtn.addEventListener("click", async () => {
              const commentId = rbtn.dataset.commentId;
              const textarea = rbtn.previousElementSibling;
              const content = textarea.value.trim();
              if (!content) return;

              try {
                const res = await fetch(`${BASE_URL}/comments/${commentId}/reply`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${JWT}`,
                  },
                  body: JSON.stringify({ content }),
                });

                if (!res.ok) throw new Error("Failed to submit reply");

                const repliesDiv = rbtn.nextElementSibling;
                const rDiv = document.createElement("div");
                rDiv.style.marginLeft = "1rem";
                rDiv.innerHTML = `<strong>${user.username}</strong>: ${content}`;
                repliesDiv.appendChild(rDiv);

                textarea.value = "";
              } catch (err) {
                alert(err.message);
              }
            });
          });
        } catch {
          container.innerHTML = "<p>Error loading comments.</p>";
        }
      }
    });
  });
}

/*INIT*/
fetchPosts();
