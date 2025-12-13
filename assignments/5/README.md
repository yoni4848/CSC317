# Chirp

A Twitter-inspired social media application built with Node.js, Express, and PostgreSQL.

**Live Demo:** [chirp-gzkx.onrender.com](https://chirp-gzkx.onrender.com)

## Features

- **Authentication** - Register/login with JWT-based sessions
- **Posts** - Create, view, and delete posts (280 character limit)
- **Comments** - Comment on posts with inline expansion
- **Likes** - Like/unlike posts
- **Follow System** - Follow/unfollow users
- **Feed** - Explore (all posts) and personalized feed (following)
- **Search** - Search for users and posts
- **Notifications** - Real-time notifications for likes, comments, and follows
- **Profiles** - View profiles, edit bio, see follower/following counts

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Frontend:** HTML, CSS, JavaScript
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** Render

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yoni4848/CSC317.git
   cd CSC317/assignments/5
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   # Create a .env file with:
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=chirp
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your_secret_key
   ```

4. Initialize the database
   ```bash
   psql -d chirp -f database/schema.sql
   ```

5. Start the server
   ```bash
   npm start
   ```

6. Open [http://localhost:3001](http://localhost:3001)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create a post |
| DELETE | `/api/posts/:id` | Delete a post |
| POST | `/api/posts/:id/like` | Like a post |
| DELETE | `/api/posts/:id/like` | Unlike a post |
| GET | `/api/posts/:id/comments` | Get comments |
| POST | `/api/posts/:id/comments` | Add comment |
| DELETE | `/api/comments/:id` | Delete comment |
| GET | `/api/users/:id` | Get user profile |
| POST | `/api/users/:id/follow` | Follow user |
| DELETE | `/api/users/:id/follow` | Unfollow user |
| GET | `/api/timeline` | Get personalized feed |
| GET | `/api/explore` | Get all posts |
| GET | `/api/search` | Search users/posts |
| GET | `/api/notifications` | Get notifications |

## Team

| Member | Role |
|--------|------|
| Adarsha Bomjan | Frontend |
| Favour Godbless | Frontend |
| Yonas Melkie | Database & API |
| Roberto Ledesma | Middleware |
