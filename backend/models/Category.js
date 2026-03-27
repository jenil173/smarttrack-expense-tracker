const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // It is not required because we can have default categories (user: null)
    },
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        default: 'expense'
    },
    color: {
        type: String,
        default: '#8061FF'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Category', CategorySchema);
