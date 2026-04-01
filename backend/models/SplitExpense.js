const mongoose = require('mongoose');

const SplitExpenseSchema = new mongoose.Schema({
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalAmount: {
        type: Number,
        required: [true, 'Please add a total amount'],
        min: [1, 'Amount must be greater than zero']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true
    },
    participants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null // null for external participants
            },
            email: {
                type: String,
                required: [true, 'Participant email is required'],
                match: [
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    'Please add a valid email'
                ]
            },
            amount: {
                type: Number,
                required: true,
                min: [0, 'Amount cannot be negative']
            },
            status: {
                type: String,
                enum: ['pending', 'paid'],
                default: 'pending'
            }
        }
    ],
    status: {
        type: String,
        enum: ['active', 'settled'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SplitExpense', SplitExpenseSchema);
