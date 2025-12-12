//errorHandler.js

const notFound = (req, res, next) => {
    res.status(404).json({ error: 'Not found' });
}


const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({ error: 'Internal Server Error' });
}


module.exports = {
    notFound,
    errorHandler
};