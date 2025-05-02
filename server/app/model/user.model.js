const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
      },
    
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
      },
    
      password: {
        type: String,
        required: true,
      },

      username: {
        type: String,
        required: true,
      },
    
      avatar: {
        full: String,
        icon: String
      },
    
      bio: {
        type: String,
        default: ""
      },

      role: {
        type: String,
        default: 'user',
      },
    
      createdAt: {
        type: Date,
        default: Date.now
      }
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


userSchema.set('toJSON', { virtuals: true });
const userModel = mongoose.model('User', userSchema);

module.exports = { userSchema, userModel }
