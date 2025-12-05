require('dotenv').config();
const express = require('express');
const db = require('./database/db')
const app = express();
const bcrypt = require('bcrypt');
app.use(express.json());


const PORT = 3000;


// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const followRoutes = require('./routes/follows');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', followRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok'
    });
});

app.get('/api/info', (req, res) => {
    res.json({
        project: 'Twitter clone',
        version: 1.0
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
