# Blog Platform (Reader + Admin)

## Overview
This is a full-stack blog platform designed to demonstrate a **RESTful API backend** with **role-based authentication** and **separate front-ends** for readers and the admin.  

- **Reader Frontend:** Allows public users to view posts, sign up, log in, and comment.  
- **Admin Frontend:** Allows the blog admin to create, edit, publish/unpublish, delete posts, and manage comments.  

This project highlights API-first design, JWT authentication, and frontend-backend separation.

---

## Features

### Reader
- View all published posts by Admin
- Post comments if logged in
- See comment counts on each post
- Modal view to read full articles with comments
- Login / Signup with JWT authentication
- Responsive design for mobile and desktop

### Admin
- Create new blog posts
- Publish or unpublish posts
- Delete posts
- View all comments on posts
- Reply to user comments
- Draft badge for unpublished posts
- Responsive admin dashboard

---

## Tech Stack
- **Backend:** Node.js, Express.js, Prisma, PostgreSQL  
- **Authentication:** JWT  
- **Frontend (Reader):** HTML, CSS, Vanilla JavaScript  
- **Frontend (Admin):** HTML, CSS, Vanilla JavaScript  
- **Deployment:** Localhost or any PaaS (Render, Railway, etc.)

---

## Demo Admin Credentials
You can log in to the admin dashboard to explore all features:

Username: Irad
Password: Odyssey

**Note:** The admin account is for demo purposes only. Do not use in production.

## Demo

https://blog-project-reader.onrender.com
