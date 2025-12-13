# CSC317 - Chirp (Twitter like app) (Assignment 5)

This repository contains the source code for **Assignment 5** of the CSC317 Web Programming course. This project is a full-stack web application designed to allow users to register, log in, post images, and search for content, effectively integrating the frontend UI with a Node.js backend and MySQL database.

## 📸 Features

*   **User Management**:
    *   User Registration (Server-side validation included).
    *   User Login (Session management).
    *   Logout functionality.
*   **Post Management**:
    *   Create new posts with image upload (via Multer).
    *   Add titles and descriptions to posts.
    *   Posts are persisted in a MySQL database.
*   **Viewing & Interaction**:
    *   **Dashboard/Home**: View the latest photos uploaded by users.
    *   **Post Details**: Click on a photo to view specific details and comments.
    *   **Search**: Search for posts by keyword.
    *   **Comments**: Authenticated users can leave comments on photos.

## 🛠 Technology Stack

*   **Frontend**: HTML5, CSS3, JavaScript (Vanilla).
*   **Backend**: Node.js, Express.js.
*   **Database**: POSTGRESQL.
*   **Key Libraries**:
    *   `mysql2`: Database connectivity.
    *   `express-session` & `express-mysql-session`: Session handling.
    *   `bcrypt`: Password hashing.
    *   `multer`: Handling file uploads.

## 📂 Project Structure

```text
/assignments/5
├── public/
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── uploads/        # Directory for uploaded images
├── routes/
│   ├── index.js        # Main navigation routes
│   ├── users.js        # Authentication routes
│   └── posts.js        # Post creation and retrieval routes
├── views/
│   ├── layouts/        # Main layout file
│   ├── partials/       # Reusable HBS components (header, footer)
│   └── *.hbs           # Page templates
├── middleware/         # Custom middleware (validation, auth check)
├── config/             # Database configuration
├── app.js              # Server entry point
└── package.json
🚀 Getting Started
Follow these instructions to run the project locally.
Prerequisites
Node.js (v14+)
MySQL Community Server
Installation
Navigate to the directory:
code
Bash
cd assignments/5
Install Dependencies:
code
Bash
npm install
Database Setup:
Log into your MySQL Workbench or CLI.
Run the provided SQL script (usually located in the root or a /sql folder) to create the database schema (Tables: users, posts, comments).
If no SQL file is present, ensure you have a database named csc317db configured.
Configuration:
Open .env (or config/database.js if hardcoded) and update your database credentials:
code
Env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=csc317db
Running the Application
Start the server:
code
Bash
npm start
Note: If you have nodemon installed, you can usually run npm run dev.
View in Browser:
Open http://localhost:3000
 Testing
Registration: Try creating a new account. Ensure password validation rules work.
Login: Log in with the new account.
Upload: Navigate to the "Post" page and upload an image. Verify it appears on the home page.
Search: Use the search bar to find your post by title.
 License
This project is created for educational purposes for the CSC317 course.