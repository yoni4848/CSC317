const express = require('express');
const db = require('./database/db')
const app = express();
const bcrypt = require('bcrypt');
app.use(express.json());


const PORT = 3000;



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
