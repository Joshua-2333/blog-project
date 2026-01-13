// api/testFullFlow.js
import fetch from "node-fetch";

// CONFIG
const BASE_URL = "http://localhost:3000/api";

// store JWT after login
let TOKEN = null;
let postId = null;
let createdCommentId = null;

// HELPER: safe JSON parser
const parseJsonSafe = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("Non-JSON response received:");
    console.error(text);
    return null;
  }
};

/*AUTHENTICATION*/
// register user
const registerUser = async () => {
  console.log("\nRegistering user...");
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "josh",
        email: "josh@example.com",
        password: "password123",
      }),
    });

    const data = await res.json();
    console.log("✅ REGISTER RESPONSE:", data);
  } catch (err) {
    console.error("❌ Error registering user:", err);
  }
};

// login user
const loginUser = async () => {
  console.log("\nLogging in user...");
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernameOrEmail: "josh",
        password: "password123",
      }),
    });

    const data = await res.json();
    if (data.token) {
      TOKEN = data.token; // save token for future requests
      console.log("✅ LOGIN RESPONSE:", data);
    } else {
      console.error("❌ Login failed:", data);
    }
  } catch (err) {
    console.error("❌ Error logging in user:", err);
  }
};

/*POSTS*/
// create a new post
const createPost = async () => {
  console.log("\nCreating a new post...");

  const createRes = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      title: `Test Post ${Date.now()}`, // unique title each run
      content: "This post was created automatically for testing",
      published: true,
    }),
  });

  const createdPost = await parseJsonSafe(createRes);
  postId = createdPost?.post?.id || createdPost?.id || null;

  if (postId) {
    console.log(`✅ Post created (id: ${postId})`);
  } else {
    console.error("❌ Failed to create post");
  }
};

/*COMMENTS*/
// add comment to post
const addComment = async () => {
  if (!postId) return console.error("Cannot add comment: no postId");

  console.log("\nAdding comment...");

  const res = await fetch(`${BASE_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      content: "This is a test comment from Node script",
      postId,
    }),
  });

  const data = await parseJsonSafe(res);

  const commentId = data?.comment?.id || data?.id;
  if (commentId) {
    createdCommentId = commentId;
    console.log(`✅ Comment created (id: ${createdCommentId})`);
  } else {
    console.error("❌ Failed to create comment:", data);
  }
};

// get all comments
const getComments = async () => {
  console.log("\nFetching all comments...");

  const res = await fetch(`${BASE_URL}/comments`);
  const data = await parseJsonSafe(res);

  if (Array.isArray(data)) {
    console.log(`Retrieved ${data.length} comment(s)`);
    console.log(data);
  } else {
    console.error("❌ Unexpected comments response:", data);
  }
};

// delete comment
const deleteComment = async () => {
  if (!createdCommentId) {
    console.log("\nNo comment to delete");
    return;
  }

  console.log("\nDeleting comment...");

  const res = await fetch(`${BASE_URL}/comments/${createdCommentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  const data = await parseJsonSafe(res);
  console.log("Delete response:", data);
};

// delete all comments for post
const deleteAllCommentsForPost = async () => {
  if (!postId) return;

  console.log("\nDeleting all comments for post...");

  const res = await fetch(`${BASE_URL}/comments?postId=${postId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  const comments = await parseJsonSafe(res);

  if (Array.isArray(comments)) {
    for (const c of comments) {
      await fetch(`${BASE_URL}/comments/${c.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
    }
    console.log(`✅ Deleted ${comments.length} comment(s) for post ${postId}`);
  }
};

// delete post
const deletePost = async () => {
  if (!postId) {
    console.log("\nNo post to delete");
    return;
  }

  console.log("\nDeleting post...");

  const res = await fetch(`${BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  const data = await parseJsonSafe(res);
  console.log("Delete post response:", data);
};

/*RUN FULL FLOW*/
const testFullFlow = async () => {
  console.log("\n======= STARTING FULL API TEST =======\n");

  await registerUser();
  await loginUser();
  await createPost();
  await addComment();
  await getComments();
  await deleteComment();
  await deleteAllCommentsForPost(); // cleanup remaining comments
  await deletePost(); // cleanup post

  console.log("\n======= FULL API TEST COMPLETE =======\n");
};

// Execute
testFullFlow();
