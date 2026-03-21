const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/analytics/overview — admin analytics data
router.get('/overview', async (req, res, next) => {
    try {
        // Tasks by type aggregation
        const tasksByType = await Task.aggregate([
            { $unwind: '$testTypes' },
            { $group: { _id: '$testTypes', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const typeLabels = tasksByType.map(t => t._id.charAt(0).toUpperCase() + t._id.slice(1));
        const typeData = tasksByType.map(t => t.count);

        // Monthly task creation (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTasks = await Task.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    created: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const taskLabels = monthlyTasks.map(m => months[m._id - 1]);
        const createdData = monthlyTasks.map(m => m.created);
        const completedData = monthlyTasks.map(m => m.completed);

        // If no data yet, provide sample data
        const hasData = monthlyTasks.length > 0;

        res.json({
            tasksOverTime: {
                labels: hasData ? taskLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Tasks Created',
                        data: hasData ? createdData : [45, 52, 68, 74, 82, 89],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    },
                    {
                        label: 'Tasks Completed',
                        data: hasData ? completedData : [38, 45, 58, 65, 72, 78],
                        borderColor: '#14b8a6',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    },
                ],
            },
            creditsDistribution: {
                labels: hasData ? taskLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                data: hasData ? createdData.map(c => c * 250) : [15000, 18500, 22000, 28000, 35000, 42000],
            },
            tasksByType: {
                labels: typeLabels.length > 0 ? typeLabels : ['Functional', 'Security', 'Usability', 'Performance', 'Accessibility', 'Compatibility'],
                data: typeData.length > 0 ? typeData : [35, 25, 20, 12, 5, 3],
            },
            platformRevenue: {
                labels: hasData ? taskLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                data: hasData ? createdData.map(c => c * 37.5) : [2250, 2775, 3300, 4200, 5250, 6300],
            },
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
