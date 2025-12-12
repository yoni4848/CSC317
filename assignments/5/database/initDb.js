const pool = require('./db');

const initializeDatabase = async () => {
    const createTablesQuery = `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            age INTEGER CHECK (age >= 13),
            bio TEXT,
            profile_picture VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Posts table
        CREATE TABLE IF NOT EXISTS posts (
            post_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            content VARCHAR(280) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Comments table
        CREATE TABLE IF NOT EXISTS comments (
            comment_id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            content VARCHAR(280) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Likes table
        CREATE TABLE IF NOT EXISTS likes (
            user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            post_id INTEGER NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, post_id)
        );

        -- Follows table
        CREATE TABLE IF NOT EXISTS follows (
            follower_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            following_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (follower_id, following_id)
        );

        -- Notifications table
        CREATE TABLE IF NOT EXISTS notifications (
            notification_id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            type VARCHAR(20) NOT NULL,
            from_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createTablesQuery);
        console.log('✅ Database tables initialized successfully!');
    } catch (error) {
        console.error('Error initializing database tables:', error);
    }
};

module.exports = initializeDatabase;
