const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

// Configure AWS SDK v3 with credentials
const s3 = new S3Client({
  region: 'eu-north-1', // This should be 'eu-north-1'
  endpoint: 'https://s3.eu-north-1.amazonaws.com',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // 👈 usually false unless using localstack or similar
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'myblognestbucket', // your S3 bucket name
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName = `userAvatars/avatar_${Date.now()}${ext}`;
      console.log("Generated S3 Key:", uniqueName);  // 👈 Debug
      cb(null, uniqueName);
    }
    
  }),
  fileFilter: function (req, file, cb) {
    const isImage = file.mimetype.startsWith('image/');
    cb(null, isImage); // accept only image files
  }
});

module.exports = upload;
