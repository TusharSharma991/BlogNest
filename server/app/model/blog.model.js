const mongoose = require("mongoose");
const { Schema } = mongoose;

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
      },

      description: {
        type: String,
        required: true
      },
    
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


blogSchema.set('toJSON', { virtuals: true });
const blogModel = mongoose.model('Blog', blogSchema);

module.exports = { blogSchema, blogModel }
