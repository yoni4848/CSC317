//errorHandler.js

//404 not found handler
const notFound = (req, res, next) => {
    res.status(404).json({ error: 'Not found' });
}

//general error handler
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