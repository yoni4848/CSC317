const express = require('express');
const db = require('./database/db')
const app = express();
const bcrypt = require('bcrypt');
app.use(express.json());


const PORT = 3000;





app.delete('/api/comments/:id', async (req, res) => {
    try{
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM comments WHERE comment_id = $1', [id]
        );

        if (result.rowCount === 0){
            return res.status(404).json({error: 'comment not found'});
        }

        res.status(200).json({message: 'comment deleted successfully'});

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

app.post('/api/users/:id/follow', async (req, res) => {
    try{
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id){
            return res.status(400).json({error: 'user_id required'});
        }

        if (parseInt(user_id) === parseInt(id)){
            return res.status(400).json({error: 'Cannot follow yourself'});
        }

        const result = await db.query(
            'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) RETURNING *', [user_id, id]
        );

        res.status(201).json(result.rows[0]);

    }catch(err){
        console.error(err);

        if (err.code === '23503'){
            return res.status(404).json({error: 'user not found'});
        }
        else if (err.code === '23505'){
            return res.status(409).json({error: 'already following this user'});
        }

        res.status(500).json({error: 'database error'});
    }
});

app.delete('/api/users/:id/follow', async (req, res) => {
    try{
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id){
            return res.status(400).json({error: 'user_id required'});
        }

        const result = await db.query(
            'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [user_id, id]
        );

        if (result.rowCount === 0){
            return res.status(404).json({error: 'not following this user'});
        }

        res.status(200).json({message: 'unfollowed successfully'});

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

app.get('/api/users/:id/followers', async (req, res) => {
    try{
        const { id } = req.params;

        const result = await db.query(
            'SELECT users.user_id, users.username, users.profile_picture, users.bio, follows.created_at FROM follows JOIN users ON follows.follower_id = users.user_id WHERE follows.following_id = $1', [id]
        );

        res.status(200).json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

app.get('/api/users/:id/following', async (req, res) => {
    try{
        const { id } = req.params;

        const result = await db.query(
            'SELECT users.user_id, users.username, users.profile_picture, users.bio, follows.created_at FROM follows JOIN users ON follows.following_id = users.user_id WHERE follows.follower_id = $1', [id]
        );

        res.status(200).json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'database error'});
    }
});

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
