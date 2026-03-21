const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    taskName: {
        type: String,
        default: '',
    },
    tester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    testerName: {
        type: String,
        default: '',
    },
    testerRating: {
        type: Number,
        default: 0,
    },
    proofType: {
        type: String,
        enum: ['video', 'screenshots', 'document', 'other'],
        default: 'screenshots',
    },
    proofUrl: {
        type: String,
        default: '',
    },
    observations: {
        type: String,
        required: true,
    },
    testResult: {
        type: String,
        enum: ['pass', 'issues-found', 'fail'],
        default: 'pass',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'needs-revision', 'rejected'],
        default: 'pending',
    },
    aiVerification: {
        type: String,
        enum: ['pending', 'verified', 'low-quality', 'rejected'],
        default: 'pending',
    },
    creditScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
}, {
    timestamps: true,
});

// Virtual alias for submittedAt
feedbackSchema.virtual('submittedAt').get(function () {
    return this.createdAt;
});

feedbackSchema.set('toJSON', { virtuals: true });
feedbackSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
