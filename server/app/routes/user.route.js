const UserController = require('../controller/user.controller');

const upload = require('../middlewares/uploadAvatar');
const auth = require('../middlewares/auth');

module.exports = app => {
    app.post('/user/register', UserController.register);
    app.post('/user/authenticate', UserController.authenticate);

    app.post('/user/uploadAvatar',auth,upload.single('avatar'), UserController.uploadAvatar);
    app.get('/user/avatar/:id', UserController.getUserAvatar);

};
