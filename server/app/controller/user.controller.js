const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require('../_helper/db');
const { tokenModel: Token } = require("../model/token.model");
const response = require("../_helper/response");

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
// const AWS = require('aws-sdk');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');


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

class UserController {

  static async wakeUp(req, res) {
    try {
      return response(res, "WakeUp Successfully!", 200);
    } catch (err) {
      return response(res, "Server Error", 500, { message: err.message });
    }
  }


  static async register(req, res) {
    try {
      const { email, password, name, username } = req.body;

      if (!email || !password || !name || !username) {
        return response(res, "Requested Data Missing", 400);
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return response(res, "Email already registered", 409);
      }

      const user = new User({
        email,
        name,
        username,
        password: bcrypt.hashSync(password, 10),
        avatar: { full: '', icon: '' }
      });

      const savedUser = await user.save();
      return response(res, "Data Saved Successfully!", 200, savedUser);
    } catch (err) {
      return response(res, "Server Error", 500, { message: err.message });
    }
  }

  static async authenticate(req, res) {
    try {
      const { username, password } = req.body;
  
      if (!username || !password) {
        return response(res, "Requested Data Missing", 400);
      }
  
      const user = await User.findOne({ username });
      if (!user) {
        return response(res, "Invalid email or password", 401);
      }
  
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return response(res, "Invalid email or password", 401);
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      await Token.create({ user_id: user._id, token });
  
      const { password: _, ...sanitizedUser } = user.toObject(); // remove password
  
      return response(res, "Login successful", 200, { token, user: sanitizedUser });
    } catch (err) {
      return response(res, "Server Error", 500, { message: err.message });
    }
  }


  // static uploadAvatar = async (req, res) => {
  //   try {

  //     const file = req.file;
  //     const userId = req.user.id;
      
  //     if (!userId || !file) {
  //       return response(res, "Requested Data is Missing", 400);
  //     }
      
  //     const avatarDir = path.join(__dirname, '../../../../userAvatars');
  //     const fullFilename = `full_${file.filename}`;
  //     const iconFilename = `icon_${file.filename}`;
  //     const fullPath = path.join(avatarDir, fullFilename);
  //     const iconPath = path.join(avatarDir, iconFilename);
      
  //     const existingUser = await User.findById(userId).select('avatar');
  //     const oldFull = existingUser?.avatar?.full;
  //     const oldIcon = existingUser?.avatar?.icon;
  
  //     const tryDelete = (filePath) => {
  //       const resolvedPath = path.resolve(__dirname, '../../../../', filePath);
  //       if (filePath && fs.existsSync(resolvedPath)) {
  //         fs.unlinkSync(resolvedPath);
  //       }
  //     };
  
  //     tryDelete(oldFull);
  //     tryDelete(oldIcon);

  //     await sharp(file.path).resize(100, 100).toFile(iconPath);
  //     fs.renameSync(file.path, fullPath);
  
  //     const updatedUser = await User.findByIdAndUpdate(
  //       userId,
  //       {
  //         avatar: {
  //           full: `userAvatars/${fullFilename}`,
  //           icon: `userAvatars/${iconFilename}`,
  //         },
  //       },
  //       { new: true }
  //     );
  
  //     if (!updatedUser) {
  //       return response(res, "Data not saved", 404);
  //     }
  
  //     return response(res, "Data Updated", 200);
  
  //   } catch (err) {
  //     console.error('Upload error:', err); // ← Add this
  //     res.status(500).json({ message: 'Something went wrong' });
  //   }
    
  // };


  static uploadAvatar = async (req, res) => {
    try {
      const file = req.file;
      const userId = req.user.id;
    
      if (!userId || !file || !file.location) {
        return response(res, "Requested Data is Missing", 400);
      }
    
      const existingUser = await User.findById(userId).select('avatar');
      const oldUrl = existingUser?.avatar?.full;
    
      if (oldUrl) {
        console.log('Old URL:', oldUrl); // Log the old avatar URL
        const urlParts = oldUrl.split('/');
        const keyIndex = urlParts.findIndex(part => part === 'userAvatars');
        const key = urlParts.slice(keyIndex).join('/'); // e.g., userAvatars/avatar_168...png
    
        const params = {
          Bucket: 'myblognestbucket', // your S3 bucket name
          Key: key
        };
    
        console.log('Deleting object from S3 with key:', key); // Log the S3 object key
    
        await s3.send(new DeleteObjectCommand(params)); // Delete old avatar from S3
      }
    
      // Update user avatar in DB
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          avatar: {
            full: file.location,
            icon: file.location // using same image for both
          },
        },
        { new: true }
      );
    
      if (!updatedUser) {
        return response(res, "Data not saved", 404);
      }
    
      return response(res, "Data Updated", 200);
    
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };
  
  


  static getUserAvatar = async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId).select('avatar');
  
      if (!user || !user.avatar || !user.avatar.full || !user.avatar.icon) {
        return res.status(404).json({ message: 'Avatar not found' });
      }
      
      return res.status(200).json({ avatar: user.avatar });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  };
  

  
}

module.exports = UserController;
