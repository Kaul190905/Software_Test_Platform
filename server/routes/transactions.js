const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/transactions — list transactions
router.get('/', async (req, res, next) => {
    try {
        let filter = {};

        // Non-admin users only see their own transactions
        if (req.user.role !== 'admin') {
            filter.user = req.user._id;
        }

        const { type, status } = req.query;
        if (type && type !== 'all') filter.type = type;
        if (status && status !== 'all') filter.status = status;

        const transactions = await Transaction.find(filter)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });

        // Format for frontend
        const formatted = transactions.map(t => ({
            id: t._id,
            type: t.type,
            user: t.userName || (t.user && t.user.name) || 'Unknown',
            userName: t.userName || (t.user && t.user.name) || 'Unknown',
            userType: t.userType || (t.user && t.user.role) || 'tester',
            amount: t.amount,
            description: t.description,
            taskName: t.taskName,
            timestamp: t.createdAt,
            status: t.status,
        }));

        res.json({ transactions: formatted });
    } catch (err) {
        next(err);
    }
});

// GET /api/transactions/wallet — wallet summary for current user
router.get('/wallet', async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        const formatted = transactions.map(t => ({
            id: t._id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            taskName: t.taskName,
            timestamp: t.createdAt,
            status: t.status,
        }));

        res.json({
            balance: req.user.walletBalance || 0,
            pendingCredits: req.user.pendingCredits || 0,
            totalEarnings: req.user.totalEarnings || 0,
            transactions: formatted,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
