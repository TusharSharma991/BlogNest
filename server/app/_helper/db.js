const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Connection to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected'))
.catch((err) => console.error('MongoDB connection error:', err));

mongoose.Promise = global.Promise;

// Exporting DB connection and models
module.exports = {
  connection: mongoose.connection,
  User: require('../model/user.model').userModel,
  Blog: require('../model/blog.model').blogModel,
  Comment: require('../model/comment.model').commentModel,
  Token: require('../model/token.model').tokenModel,
};
