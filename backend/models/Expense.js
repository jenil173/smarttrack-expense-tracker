const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [50, 'Title can not be more than 50 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Please add a positive number'],
        min: [0.01, 'Amount must be a positive value']
    },
    category: {
        type: String,
        required: [true, 'Please select a category']
    },
    date: {
        type: Date,
        default: Date.now
    },
    mood: {
        type: String,
        enum: ['Happy', 'Stressed', 'Neutral'],
        default: 'Neutral'
    },
    note: {
        type: String,
        maxlength: [200, 'Note can not be more than 200 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
