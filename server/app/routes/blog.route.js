const BlogController = require('../controller/blog.controller');

const auth = require('../middlewares/auth');

module.exports = app => {
    app.post('/blog/create',auth, BlogController.createBlog);
    app.get('/blog/getBlogs',auth, BlogController.getBlogs);
    app.get('/blog/getMyBlogs',auth, BlogController.getMyBlogs);
    app.post('/blog/updateById',auth, BlogController.updateById);
   
};
