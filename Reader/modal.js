// Reader/modal.js
const BASE_URL = "http://localhost:3000/api";

const modal = document.getElementById("post-modal");
const closeBtn = document.getElementById("close-modal");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalContent = document.getElementById("modal-content");

const commentsSection = document.getElementById("comments-section");
const commentInput = document.getElementById("comment-input");
const submitCommentBtn = document.getElementById("submit-comment");
const commentMessage = document.getElementById("comment-message");
const commentForm = document.getElementById("comment-form");
const loginRequired = document.getElementById("login-required");

let currentPostId = null;

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
}

if (closeBtn) closeBtn.addEventListener("click", closeModal);

/* ---------------- LOAD POST ---------------- */
async function loadPost() {
  const res = await fetch(`${BASE_URL}/posts/${currentPostId}`);
  const post = await res.json();

  modalTitle.textContent = post.title;
  modalMeta.textContent = `By ${post.author.username}`;
  modalContent.textContent = post.content;
}

/* ---------------- LOAD COMMENTS ---------------- */
async function loadComments() {
  commentsSection.innerHTML = "";

  const res = await fetch(`${BASE_URL}/comments?postId=${currentPostId}`);
  const comments = await res.json();

  comments.forEach((c) => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `<strong>${c.user.username}</strong>: ${c.content}`;
    commentsSection.appendChild(div);
  });
}

/* ---------------- SUBMIT COMMENT ---------------- */
submitCommentBtn.addEventListener("click", async () => {
  const JWT = localStorage.getItem("jwt");
  if (!JWT || !commentInput.value.trim()) return;

  await fetch(`${BASE_URL}/comments`, {
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

  commentInput.value = "";
  loadComments();
});
