require('dotenv').config();
const express = require('express');
const db = require('./database/db')
const initializeDatabase = require('./database/initDb');
const app = express();
const bcrypt = require('bcrypt');
app.use(express.json());
app.use(express.static('public'));
const{notFound, errorHandler} = require('./middlewares/errorHandlers');

// Initialize database tables
initializeDatabase();

const PORT = process.env.PORT || 3001;


// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const followRoutes = require('./routes/follows');
const timelineRoutes = require('./routes/timeline');
const exploreRoutes = require('./routes/explore');
const searchRoutes = require('./routes/search');
const notifcationRoutes = require('./routes/notifications');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', followRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notifcationRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok'
    });
});

app.get('/api/info', (req, res) => {
    res.json({
        project: 'Chirp',
        version: 1.0
    });
});
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});




module.exports = app;