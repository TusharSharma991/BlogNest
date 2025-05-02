const CommentController = require('../controller/comment.controller');

const auth = require('../middlewares/auth');

module.exports = app => {
    app.post('/comment/create',auth, CommentController.create);
    app.get('/comment/getCommentsByBlogId/:id', CommentController.getCommentsByBlogId);

};
