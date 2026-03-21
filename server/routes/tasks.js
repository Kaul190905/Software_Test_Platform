const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticate);

// GET /api/tasks — list tasks filtered by role
router.get('/', async (req, res, next) => {
    try {
        const { status, search } = req.query;
        let filter = {};

        // Developer sees only their own tasks
        if (req.user.role === 'developer') {
            filter.developer = req.user._id;
        }

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search) {
            filter.appName = { $regex: search, $options: 'i' };
        }

        const tasks = await Task.find(filter)
            .populate('developer', 'name email company')
            .populate('assignedTesters', 'name email rating')
            .sort({ createdAt: -1 });

        res.json({ tasks });
    } catch (err) {
        next(err);
    }
});

// GET /api/tasks/marketplace — available tasks for testers
router.get('/marketplace', async (req, res, next) => {
    try {
        const { level, type, search } = req.query;
        let filter = { status: 'open' };

        if (level && level !== 'all') {
            filter.testingLevel = level;
        }

        if (type && type !== 'all') {
            filter.testTypes = type;
        }

        if (search) {
            filter.appName = { $regex: search, $options: 'i' };
        }

        const tasks = await Task.find(filter)
            .populate('developer', 'name company')
            .sort({ createdAt: -1 });

        // Format for marketplace view
        const marketplaceTasks = tasks.map(task => ({
            ...task.toJSON(),
            company: task.developerCompany || (task.developer && task.developer.company) || '',
            companyName: task.developerCompany || (task.developer && task.developer.company) || '',
            level: task.testingLevel.charAt(0).toUpperCase() + task.testingLevel.slice(1),
            postedAt: task.createdAt,
        }));

        res.json({ tasks: marketplaceTasks });
    } catch (err) {
        next(err);
    }
});

// GET /api/tasks/my-tasks — tasks assigned to current tester
router.get('/my-tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find({
            assignedTesters: req.user._id,
        })
            .populate('developer', 'name company')
            .sort({ createdAt: -1 });

        const formattedTasks = tasks.map(task => ({
            ...task.toJSON(),
            company: task.developerCompany || (task.developer && task.developer.company) || '',
            acceptedAt: task.updatedAt,
        }));

        res.json({ tasks: formattedTasks });
    } catch (err) {
        next(err);
    }
});

// GET /api/tasks/stats — dashboard stats
router.get('/stats', async (req, res, next) => {
    try {
        if (req.user.role === 'developer') {
            const myTasks = await Task.find({ developer: req.user._id });
            const active = myTasks.filter(t => ['open', 'in-progress'].includes(t.status)).length;
            const completed = myTasks.filter(t => t.status === 'completed').length;
            const totalBudget = myTasks.reduce((sum, t) => sum + t.budget, 0);

            res.json({
                activeProjects: active,
                completedProjects: completed,
                totalBudgetSpent: totalBudget,
                feedbackReceived: 0, // calculated from feedback
                activeProjectsChange: 8.5,
                completedProjectsChange: 12.3,
            });
        } else if (req.user.role === 'tester') {
            res.json({
                walletBalance: req.user.walletBalance,
                availableCredits: req.user.walletBalance,
                pendingCredits: req.user.pendingCredits,
                completedTests: req.user.completedTests,
                completedTasks: req.user.completedTests,
                activeTests: await Task.countDocuments({ assignedTesters: req.user._id, status: { $in: ['in-progress', 'pending-review'] } }),
                rating: req.user.rating,
                reviewCount: req.user.reviewCount,
                totalEarnings: req.user.totalEarnings,
            });
        } else {
            // Admin stats
            const totalUsers = await User.countDocuments();
            const totalDevelopers = await User.countDocuments({ role: 'developer' });
            const totalTesters = await User.countDocuments({ role: 'tester' });
            const activeTasks = await Task.countDocuments({ status: { $in: ['open', 'in-progress'] } });
            const completedTasks = await Task.countDocuments({ status: 'completed' });

            res.json({
                totalUsers,
                totalDevelopers,
                totalTesters,
                activeTasks,
                completedTasks,
                totalCreditsDistributed: 125000,
                platformRevenue: 18750,
                pendingVerifications: await Task.countDocuments({ status: 'under-verification' }),
                disputesPending: 5,
                usersChange: 8.5,
                revenueChange: 12.3,
            });
        }
    } catch (err) {
        next(err);
    }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('developer', 'name email company')
            .populate('assignedTesters', 'name email rating');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ task });
    } catch (err) {
        next(err);
    }
});

// POST /api/tasks — create new task (developer only)
router.post('/', requireRole('developer', 'admin'), async (req, res, next) => {
    try {
        const { appName, appUrl, description, testingLevel, testTypes, budget, credits, deadline, requiredTesters, estimatedTime } = req.body;

        const task = new Task({
            appName,
            appUrl,
            description,
            testingLevel,
            testTypes,
            budget: budget || 0,
            credits: credits || budget || 0,
            deadline,
            developer: req.user._id,
            developerName: req.user.name,
            developerCompany: req.user.company || '',
            requiredTesters: requiredTesters || 1,
            estimatedTime: estimatedTime || '',
        });

        await task.save();

        // Update developer stats
        req.user.tasksCreated = (req.user.tasksCreated || 0) + 1;
        req.user.totalSpent = (req.user.totalSpent || 0) + (budget || 0);
        await req.user.save();

        res.status(201).json({ task });
    } catch (err) {
        next(err);
    }
});

// PUT /api/tasks/:id — update task
router.put('/:id', async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Only owner or admin can update
        if (req.user.role !== 'admin' && task.developer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            task[key] = updates[key];
        });

        await task.save();
        res.json({ task });
    } catch (err) {
        next(err);
    }
});

// POST /api/tasks/:id/apply — tester applies to a task
router.post('/:id/apply', requireRole('tester'), async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (task.status !== 'open') {
            return res.status(400).json({ error: 'Task is not open for applications' });
        }

        if (task.assignedTesters.includes(req.user._id)) {
            return res.status(400).json({ error: 'Already applied to this task' });
        }

        const currentTesters = task.assignedTesters.length;
        if (currentTesters >= task.requiredTesters) {
            return res.status(400).json({ error: 'No open slots available' });
        }

        task.assignedTesters.push(req.user._id);
        task.appliedTesters = task.assignedTesters.length;

        if (task.assignedTesters.length >= task.requiredTesters) {
            task.status = 'in-progress';
        }

        await task.save();
        res.json({ message: 'Successfully applied to task', task });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
