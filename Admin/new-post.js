/*Admion/new-post.js*/
const BASE_URL = "http://localhost:3000/api";
const JWT = localStorage.getItem("jwt");
const user = JSON.parse(localStorage.getItem("user") || "{}");

/* ---------------- AUTH GUARD ---------------- */
if (!JWT || user.role !== "ADMIN") {
  window.location.href = "../Reader/index.html";
}

/* ---------------- DOM ---------------- */
const titleInput = document.getElementById("post-title");
const contentInput = document.getElementById("post-content");
const publishedInput = document.getElementById("post-published");
const createBtn = document.getElementById("create-btn");
const messageEl = document.getElementById("editor-message");

const logoutBtn = document.getElementById("logout-btn");
const backBtn = document.getElementById("back-btn");

const addImageBtn = document.getElementById("add-image-btn");
const imageInput = document.getElementById("image-input");
const imagePreview = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");

/* ---------------- NAV ---------------- */
backBtn.addEventListener("click", () => {
  window.location.href = "admin.html";
});

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../Reader/index.html";
});

/* ---------------- ADD IMAGE ---------------- */
addImageBtn.addEventListener("click", () => {
  imageInput.click();
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    previewImg.src = reader.result;
    imagePreview.hidden = false;

    const markdownImage = `\n\n![Image](${reader.result})\n\n`;
    contentInput.value += markdownImage;
  };

  reader.readAsDataURL(file);
});

/* ---------------- CREATE POST ---------------- */
createBtn.addEventListener("click", async () => {
  messageEl.textContent = "";

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    messageEl.textContent = "Title and content are required";
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
        title,
        content,
        published: publishedInput.checked,
      }),
    });

    if (!res.ok) throw new Error("Failed to create post");

    window.location.href = "admin.html";
  } catch (err) {
    messageEl.textContent = err.message;
  }
});
