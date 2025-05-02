const mongoose = require('mongoose');
const { Schema } = mongoose;


const tokenSchema = new mongoose.Schema({

    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    token: {
        type: String,
        required: true
    }
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    },
);

tokenSchema.set('toJSON', { virtuals: true });
const tokenModel = mongoose.model('Token', tokenSchema);
module.exports = { tokenSchema, tokenModel };
