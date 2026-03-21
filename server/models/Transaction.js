const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        default: '',
    },
    userType: {
        type: String,
        enum: ['developer', 'tester', 'admin'],
        default: 'tester',
    },
    type: {
        type: String,
        enum: ['credit', 'debit', 'commission', 'withdrawal', 'refund'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    taskName: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'failed'],
        default: 'completed',
    },
}, {
    timestamps: true,
});

// Virtual alias for timestamp
transactionSchema.virtual('timestamp').get(function () {
    return this.createdAt;
});

transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema);
