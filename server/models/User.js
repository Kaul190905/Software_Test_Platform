const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    role: {
        type: String,
        enum: ['developer', 'tester', 'admin'],
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'suspended', 'inactive'],
        default: 'active',
    },
    avatar: {
        type: String,
        default: null,
    },
    // Developer-specific fields
    company: {
        type: String,
        default: '',
    },
    tasksCreated: {
        type: Number,
        default: 0,
    },
    totalSpent: {
        type: Number,
        default: 0,
    },
    // Tester-specific fields
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
    completedTests: {
        type: Number,
        default: 0,
    },
    walletBalance: {
        type: Number,
        default: 0,
    },
    pendingCredits: {
        type: Number,
        default: 0,
    },
    totalEarnings: {
        type: Number,
        default: 0,
    },
    // Admin-specific fields
    permissions: {
        type: [String],
        default: [],
    },
    // OTP verification
    otpVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        },
    },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for joinedDate (alias for createdAt)
userSchema.virtual('joinedDate').get(function () {
    return this.createdAt;
});

module.exports = mongoose.model('User', userSchema);
