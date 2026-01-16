// Reader/modal.js
const BASE_URL = "http://localhost:3000/api";

const modal = document.getElementById("post-modal");
const closeBtn = document.getElementById("close-modal");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalTextContent = document.getElementById("modal-content"); // renamed for clarity

const commentsSection = document.getElementById("comments-section");
const commentInput = document.getElementById("comment-input");
const submitCommentBtn = document.getElementById("submit-comment");
const commentMessage = document.getElementById("comment-message");
const commentForm = document.getElementById("comment-form");
const loginRequired = document.getElementById("login-required");

let currentPostId = null;
let postImageEl = null; // image element for modal

/* ---------------- OPEN MODAL ---------------- */
export async function openModal(postId) {
  currentPostId = postId;
  modal.hidden = false;
  document.body.style.overflow = "hidden";

  const JWT = localStorage.getItem("jwt");
  commentForm.hidden = !JWT;
  loginRequired.hidden = !!JWT;

  await loadPost();
  await loadComments();
}

/* ---------------- CLOSE MODAL ---------------- */
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  currentPostId = null;

  // Remove previous image if exists
  if (postImageEl) {
    postImageEl.remove();
    postImageEl = null;
  }

  // Clear previous text and comments
  modalTextContent.textContent = "";
  commentsSection.innerHTML = "";
  commentInput.value = "";
  commentMessage.textContent = "";
}

if (closeBtn) closeBtn.addEventListener("click", closeModal);

/* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

/* ---------------- LOAD POST ---------------- */
async function loadPost() {
  try {
    const res = await fetch(`${BASE_URL}/posts/${currentPostId}`);
    if (!res.ok) throw new Error("Post not found");
    const post = await res.json();

    // Only allow modal for admin id = 3
    if (post.author.id !== 3) {
      modalTitle.textContent = "Unauthorized";
      modalMeta.textContent = "";
      modalTextContent.textContent = "This post cannot be displayed.";
      commentForm.hidden = true;
      loginRequired.hidden = true;
      return;
    }

    modalTitle.textContent = post.title;
    modalMeta.textContent = `By ${post.author.username}`;

    // Render image if available
    if (post.imageUrl) {
      postImageEl = document.createElement("img");
      postImageEl.src = post.imageUrl;
      postImageEl.alt = `Image for ${post.title}`;
      postImageEl.className = "modal-post-image";
      postImageEl.style.maxWidth = "100%";
      postImageEl.style.marginBottom = "1rem";
      postImageEl.style.borderRadius = "8px";
      modalTextContent.parentNode.insertBefore(postImageEl, modalTextContent);
    }

    // Render text content
    const contentParagraph = document.createElement("p");
    contentParagraph.textContent = post.content;
    contentParagraph.style.whiteSpace = "pre-wrap";
    modalTextContent.appendChild(contentParagraph);
  } catch (err) {
    modalTitle.textContent = "Error loading post";
    modalMeta.textContent = "";
    modalTextContent.textContent = err.message;
    commentForm.hidden = true;
    loginRequired.hidden = true;
  }
}

/* ---------------- LOAD COMMENTS ---------------- */
async function loadComments() {
  commentsSection.innerHTML = "";
  try {
    const res = await fetch(`${BASE_URL}/comments?postId=${currentPostId}`);
    if (!res.ok) throw new Error("Error fetching comments");
    const comments = await res.json();

    if (!comments.length) {
      commentsSection.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
      return;
    }

    comments.forEach((c) => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<strong>${c.user.username}</strong>: ${c.content}`;
      commentsSection.appendChild(div);
    });
  } catch (err) {
    commentsSection.innerHTML = `<p>${err.message}</p>`;
  }
}

/* ---------------- SUBMIT COMMENT ---------------- */
if (submitCommentBtn) {
  submitCommentBtn.addEventListener("click", async () => {
    const JWT = localStorage.getItem("jwt");
    if (!JWT || !commentInput.value.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT}`,
        },
        body: JSON.stringify({
          content: commentInput.value.trim(),
          postId: currentPostId,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit comment");

      commentInput.value = "";
      loadComments(); // reload comments after submit
    } catch (err) {
      commentMessage.textContent = err.message;
    }
  });
}
