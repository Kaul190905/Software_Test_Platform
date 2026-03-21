const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, generateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, role, company } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = new User({
            name,
            email,
            password,
            role: role || 'developer',
            company: company || '',
            status: 'pending', // pending until OTP verified
        });

        await user.save();

        const token = generateToken(user._id);
        res.status(201).json({ user, token });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ error: 'Account suspended' });
        }

        const token = generateToken(user._id);
        res.json({ user, token });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', authenticate, async (req, res, next) => {
    try {
        const { otp } = req.body;

        // Mock OTP verification — any 6-digit code works
        if (!otp || otp.length !== 6) {
            return res.status(400).json({ error: 'Invalid OTP. Must be 6 digits.' });
        }

        // Mark user as verified and active
        req.user.otpVerified = true;
        req.user.status = 'active';
        await req.user.save();

        res.json({ message: 'OTP verified successfully', user: req.user });
    } catch (err) {
        next(err);
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
