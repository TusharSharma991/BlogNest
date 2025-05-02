const express = require("express");
const app = express();
const http = require("http").Server(app);
const { Server } = require("socket.io");
const path = require('path');
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("MongoDB connection error:", err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Only allow GET, POST, PUT, DELETE
const methods = ["GET", "POST", "PUT", "DELETE"];
app.use((req, res, next) => {
  if (!methods.includes(req.method)) {
    return res.send({ EncryptedResponse: { code: 400, failed: "Method not Allowed" } });
  }
  next();
});

const avatarPath = path.join(__dirname, '../../userAvatars');
app.use('/userAvatars', express.static(avatarPath));

require("./app/routes/user.route")(app);
require("./app/routes/blog.route")(app);
require("./app/routes/comment.route")(app);

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log("Server running on port:", port);
});
