// testAuth.js
import fetch from "node-fetch";

// CONFIG
const BASE_URL = "http://localhost:3000/api/auth";

// Helper: wait for a given time (ms)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// REGISTER USER
const registerUser = async () => {
  try {
    const res = await fetch(`${BASE_URL}/register`, {
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

// LOGIN USER
const loginUser = async () => {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernameOrEmail: "josh",
        password: "password123",
      }),
    });

    const data = await res.json();
    console.log("✅ LOGIN RESPONSE:", data);
    return data.token; // return JWT for further testing
  } catch (err) {
    console.error("❌ Error logging in user:", err);
  }
};

// RUN BOTH
const testAuth = async () => {
  console.log("\nSTARTING AUTH TEST\n");
  await registerUser();
  await wait(500); // small delay to ensure DB processes registration
  const token = await loginUser();
  console.log("\nAUTH TEST COMPLETE\n");
  return token;
};

testAuth();
