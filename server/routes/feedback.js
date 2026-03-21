const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Task = require('../models/Task');
const User = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// GET /api/feedback — list feedback
router.get('/', async (req, res, next) => {
    try {
        let filter = {};

        if (req.user.role === 'developer') {
            // Get tasks owned by this developer, then find feedback for those tasks
            const myTasks = await Task.find({ developer: req.user._id }).select('_id');
            const taskIds = myTasks.map(t => t._id);
            filter.task = { $in: taskIds };
        } else if (req.user.role === 'tester') {
            filter.tester = req.user._id;
        }
        // Admin sees all

        const { status, taskId } = req.query;
        if (status && status !== 'all') filter.status = status;
        if (taskId) filter.task = taskId;

        const feedback = await Feedback.find(filter)
            .populate('task', 'appName appUrl status')
            .populate('tester', 'name email rating')
            .sort({ createdAt: -1 });

        res.json({ feedback });
    } catch (err) {
        next(err);
    }
});

// POST /api/feedback — submit feedback (tester)
router.post('/', requireRole('tester'), async (req, res, next) => {
    try {
        const { taskId, proofType, proofUrl, observations, testResult } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check tester is assigned
        if (!task.assignedTesters.includes(req.user._id)) {
            return res.status(403).json({ error: 'You are not assigned to this task' });
        }

        const feedback = new Feedback({
            task: taskId,
            taskName: task.appName,
            tester: req.user._id,
            testerName: req.user.name,
            testerRating: req.user.rating || 0,
            proofType: proofType || 'screenshots',
            proofUrl: proofUrl || '',
            observations,
            testResult: testResult || 'pass',
            // Mock AI verification — random score
            aiVerification: 'pending',
            creditScore: Math.floor(Math.random() * 40) + 60,
        });

        await feedback.save();

        // Update task status
        task.status = 'pending-review';
        task.progress = 100;
        await task.save();

        res.status(201).json({ feedback });
    } catch (err) {
        next(err);
    }
});

// PUT /api/feedback/:id — approve/reject feedback (developer or admin)
router.put('/:id', requireRole('developer', 'admin'), async (req, res, next) => {
    try {
        const { status, aiVerification } = req.body;

        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        if (status) feedback.status = status;
        if (aiVerification) feedback.aiVerification = aiVerification;

        await feedback.save();

        // If approved, credit the tester
        if (status === 'approved') {
            const tester = await User.findById(feedback.tester);
            if (tester) {
                const creditAmount = feedback.creditScore * 3; // Simple credit calc
                tester.walletBalance = (tester.walletBalance || 0) + creditAmount;
                tester.totalEarnings = (tester.totalEarnings || 0) + creditAmount;
                tester.completedTests = (tester.completedTests || 0) + 1;
                await tester.save();
            }

            // Check if all feedback for this task is approved
            const task = await Task.findById(feedback.task);
            if (task) {
                const allFeedback = await Feedback.find({ task: task._id });
                const allApproved = allFeedback.every(f => f.status === 'approved');
                if (allApproved) {
                    task.status = 'completed';
                    await task.save();
                }
            }
        }

        res.json({ feedback });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
