//validator.js
const MAX_POST_LENGTH = 300;
const MAX_COMMENT_LENGTH = 200;


//middleware to validate post content
const validatePost = (req, res, next) => {
    let { content } = req.body;

    if( typeof content != 'string'){
        return res.status(400).json({ error: 'Post content must be a string' });
    }
        content = content.trim();

     
     if (!content || content.length === 0) {
        return res.status(400).json({ error: 'Post content cannot be empty' });
    }
    
    if(content.length > MAX_POST_LENGTH){
        return res.status(400).json({ error: 'Post content exceeds ${MAX_POST_LENGTH} characters limit'
        });
    }

    req.body.content = content;
    
    next();



}
//middleware to validate comment content
 const validateComment = (req, res, next) => {
     let { content } = req.body;

    if( typeof content != 'string'){
        return res.status(400).json({ error: 'comment content must be a string' });
    }
        content = content.trim();

     
     if (!content || content.length === 0) {
        return res.status(400).json({ error: 'comment content cannot be empty' });
    }
    
    if(content.length > MAX_COMMENT_LENGTH){
        return res.status(400).json({ error: 'comment content exceeds ${MAX_COMMENT_LENGTH} characters limit'
        });
    }

    req.body.content = content;
    
    next();


}


module.exports = {
    validatePost,
    validateComment
};



    