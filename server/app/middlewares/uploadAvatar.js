const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set destination folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../../../userAvatars');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    const uniqueName = `avatar_${Date.now()}.${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const isImage = file.mimetype.startsWith('image/');
    cb(null, isImage);
  }
});

module.exports = upload;
