// api/testComments.js
import fetch from "node-fetch";

// CONFIG
const BASE_URL = "http://localhost:3000/api";
// Paste the JWT returned from testAuth.js login
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJqb3NoIiwiZW1haWwiOiJqb3NoQGV4YW1wbGUuY29tIiwiaWF0IjoxNzY4MzMzMzU3LCJleHAiOjE3Njg0MTk3NTd9.ZGN3CIrE1uBSRQfON5uSMWrqwOosZToehznlwckeJ9A";

let postId = null;
let createdCommentId = null;

// HELPER: Safe JSON parser
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

// ENSURE AT LEAST ONE POST EXISTS
const ensurePost = async () => {
  console.log("Ensuring a post exists...");

  const res = await fetch(`${BASE_URL}/posts`);
  const posts = await parseJsonSafe(res);

  // Use existing post if found
  if (Array.isArray(posts) && posts.length > 0) {
    postId = posts[0].id;
    console.log(`Using existing post (id: ${postId})`);
    return;
  }

  // Otherwise create a test post (published: true)
  console.log("No posts found. Creating one...");

  const createRes = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      title: "Test Post",
      content: "This post was created automatically for comment testing",
      published: true, // important: make the post commentable
    }),
  });

  const createdPost = await parseJsonSafe(createRes);
  // Handle both common API response formats
  postId = createdPost?.post?.id || createdPost?.id || null;

  if (postId) {
    console.log(`Post created (id: ${postId})`);
  } else {
    console.error("Failed to create post");
  }
};

// ADD COMMENT TO POST
const addComment = async () => {
  if (!postId) {
    console.error("Cannot add comment: no postId available");
    return;
  }

  console.log("Adding comment...");

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

  // Handle both response formats
  const commentObj = data?.comment || data;

  if (commentObj?.id) {
    createdCommentId = commentObj.id;
    console.log(`✅ Comment created (id: ${createdCommentId})`);
  } else {
    console.error("❌ Failed to create comment:", data);
  }
};

// GET ALL COMMENTS
const getComments = async () => {
  console.log("Fetching all comments...");

  const res = await fetch(`${BASE_URL}/comments`);
  const data = await parseJsonSafe(res);

  if (Array.isArray(data)) {
    console.log(`Retrieved ${data.length} comment(s)`);
    console.log(data);
  } else {
    console.error("Unexpected comments response:", data);
  }
};

// DELETE CREATED COMMENT
const deleteComment = async () => {
  if (!createdCommentId) {
    console.log("No comment to delete");
    return;
  }

  console.log("Deleting comment...");

  const res = await fetch(`${BASE_URL}/comments/${createdCommentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  const data = await parseJsonSafe(res);
  console.log("Delete response:", data);
};

// RUN FULL TEST FLOW
const testComments = async () => {
  console.log("\nSTARTING COMMENT TEST\n");
  await ensurePost();
  await addComment();
  await getComments();
  await deleteComment();
  console.log("\nCOMMENT TEST COMPLETE\n");
};

testComments();
