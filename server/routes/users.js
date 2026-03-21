const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// GET /api/users/stats — current user dashboard stats
router.get('/stats', async (req, res, next) => {
    try {
        res.json({ user: req.user });
    } catch (err) {
        next(err);
    }
});

// GET /api/users — list all users (admin only)
router.get('/', requireRole('admin'), async (req, res, next) => {
    try {
        const { role, status, search } = req.query;
        let filter = {};

        if (role && role !== 'all') filter.role = role;
        if (status && status !== 'all') filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(filter).sort({ createdAt: -1 });

        // Format into the shape the frontend expects
        const developers = users.filter(u => u.role === 'developer').map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            company: u.company,
            tasksCreated: u.tasksCreated || 0,
            completedTasks: u.tasksCreated || 0,
            totalSpent: u.totalSpent || 0,
            credits: u.totalSpent || 0,
            joinedAt: u.createdAt,
        }));

        const testers = users.filter(u => u.role === 'tester').map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            rating: u.rating,
            completedTests: u.completedTests || 0,
            completedTasks: u.completedTests || 0,
            totalEarned: u.totalEarnings || 0,
            credits: u.totalEarnings || 0,
            joinedAt: u.createdAt,
        }));

        // Combined flat list for admin user table
        const allUsers = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            completedTasks: u.role === 'tester' ? (u.completedTests || 0) : (u.tasksCreated || 0),
            credits: u.role === 'tester' ? (u.totalEarnings || 0) : (u.totalSpent || 0),
            joinedAt: u.createdAt,
        }));

        res.json({
            users: allUsers,
            developers,
            testers,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/users/:id — get user profile
router.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (err) {
        next(err);
    }
});

// PUT /api/users/:id — update user (admin or self)
router.put('/:id', async (req, res, next) => {
    try {
        // Only admin or the user themselves can update
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updates = req.body;
        // Don't allow password or role changes via this route
        delete updates.password;
        if (req.user.role !== 'admin') delete updates.role;
        if (req.user.role !== 'admin') delete updates.status;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
