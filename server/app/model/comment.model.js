const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  content: {
    type: String,
    required: true
  },

  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

},
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);


commentSchema.set('toJSON', { virtuals: true });
const commentModel = mongoose.model('Comment', commentSchema);

module.exports = { commentSchema, commentModel }
