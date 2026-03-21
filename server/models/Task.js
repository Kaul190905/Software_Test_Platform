const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    appName: {
        type: String,
        required: true,
        trim: true,
    },
    appUrl: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    testingLevel: {
        type: String,
        enum: ['basic', 'intermediate', 'expert'],
        required: true,
    },
    testTypes: [{
        type: String,
        enum: ['functional', 'usability', 'security', 'performance', 'accessibility', 'compatibility'],
    }],
    budget: {
        type: Number,
        required: true,
        min: 0,
    },
    credits: {
        type: Number,
        default: 0,
    },
    deadline: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'pending-review', 'under-verification', 'completed', 'cancelled'],
        default: 'open',
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    developer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    developerName: {
        type: String,
        default: '',
    },
    developerCompany: {
        type: String,
        default: '',
    },
    assignedTesters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    requiredTesters: {
        type: Number,
        default: 1,
    },
    appliedTesters: {
        type: Number,
        default: 0,
    },
    estimatedTime: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Virtual for testersAssigned count
taskSchema.virtual('testersAssigned').get(function () {
    return this.assignedTesters ? this.assignedTesters.length : 0;
});

// Virtual for openSlots
taskSchema.virtual('openSlots').get(function () {
    return Math.max(0, this.requiredTesters - (this.assignedTesters ? this.assignedTesters.length : 0));
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
