const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const Feedback = require('./models/Feedback');
const Transaction = require('./models/Transaction');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/software-test-platform';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Task.deleteMany({});
        await Feedback.deleteMany({});
        await Transaction.deleteMany({});
        console.log('Cleared existing data');

        // ============ Create Users ============
        const password = await bcrypt.hash('Password123', 12);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@testflow.com',
            password,
            role: 'admin',
            status: 'active',
            permissions: ['all'],
            otpVerified: true,
        });

        const developer1 = await User.create({
            name: 'John Developer',
            email: 'john@devcompany.com',
            password,
            role: 'developer',
            status: 'active',
            company: 'TechCorp Inc.',
            tasksCreated: 15,
            totalSpent: 7500,
            otpVerified: true,
        });

        const developer2 = await User.create({
            name: 'Emily Chen',
            email: 'emily@startup.io',
            password,
            role: 'developer',
            status: 'active',
            company: 'StartupXYZ',
            tasksCreated: 8,
            totalSpent: 3200,
            otpVerified: true,
        });

        const developer3 = await User.create({
            name: 'Robert Wilson',
            email: 'robert@enterprise.com',
            password,
            role: 'developer',
            status: 'active',
            company: 'Enterprise Solutions',
            tasksCreated: 25,
            totalSpent: 12500,
            otpVerified: true,
        });

        const developer4 = await User.create({
            name: 'Maria Garcia',
            email: 'maria@fintech.com',
            password,
            role: 'developer',
            status: 'suspended',
            company: 'FinTech Pro',
            tasksCreated: 3,
            totalSpent: 1500,
            otpVerified: true,
        });

        const tester1 = await User.create({
            name: 'Sarah Tester',
            email: 'sarah@testing.com',
            password,
            role: 'tester',
            status: 'active',
            rating: 4.9,
            reviewCount: 142,
            completedTests: 156,
            walletBalance: 2450,
            pendingCredits: 350,
            totalEarnings: 12500,
            otpVerified: true,
        });

        const tester2 = await User.create({
            name: 'Mike QA',
            email: 'mike@qa.net',
            password,
            role: 'tester',
            status: 'active',
            rating: 4.7,
            reviewCount: 89,
            completedTests: 98,
            walletBalance: 1800,
            totalEarnings: 7800,
            otpVerified: true,
        });

        const tester3 = await User.create({
            name: 'Lisa QA',
            email: 'lisa@qaexpert.com',
            password,
            role: 'tester',
            status: 'active',
            rating: 4.5,
            reviewCount: 58,
            completedTests: 67,
            walletBalance: 980,
            totalEarnings: 5200,
            otpVerified: true,
        });

        const tester4 = await User.create({
            name: 'David Test',
            email: 'david@tester.io',
            password,
            role: 'tester',
            status: 'pending',
            rating: 0,
            completedTests: 0,
            walletBalance: 0,
            totalEarnings: 0,
            otpVerified: false,
        });

        const tester5 = await User.create({
            name: 'Anna Beta',
            email: 'anna@betatest.com',
            password,
            role: 'tester',
            status: 'active',
            rating: 4.8,
            reviewCount: 190,
            completedTests: 203,
            walletBalance: 3200,
            totalEarnings: 16200,
            otpVerified: true,
        });

        console.log('Created users');

        // ============ Create Tasks ============
        const task1 = await Task.create({
            appName: 'E-Commerce Mobile App',
            appUrl: 'https://shop.example.com',
            testingLevel: 'expert',
            testTypes: ['functional', 'usability', 'security'],
            budget: 500,
            credits: 500,
            deadline: new Date('2024-02-15'),
            status: 'in-progress',
            progress: 65,
            developer: developer1._id,
            developerName: developer1.name,
            developerCompany: developer1.company,
            assignedTesters: [tester1._id, tester3._id, tester5._id],
            requiredTesters: 3,
            appliedTesters: 3,
        });

        const task2 = await Task.create({
            appName: 'Banking Dashboard',
            appUrl: 'https://bank.example.com',
            testingLevel: 'expert',
            testTypes: ['security', 'performance', 'accessibility'],
            budget: 750,
            credits: 750,
            deadline: new Date('2024-02-20'),
            status: 'pending-review',
            progress: 100,
            developer: developer1._id,
            developerName: developer1.name,
            developerCompany: developer1.company,
            assignedTesters: [tester1._id, tester2._id, tester3._id, tester5._id, tester4._id],
            requiredTesters: 5,
            appliedTesters: 5,
        });

        const task3 = await Task.create({
            appName: 'Social Media Platform',
            appUrl: 'https://social.example.com',
            testingLevel: 'intermediate',
            testTypes: ['functional', 'usability'],
            budget: 350,
            credits: 350,
            deadline: new Date('2024-02-25'),
            status: 'open',
            progress: 0,
            developer: developer1._id,
            developerName: developer1.name,
            developerCompany: developer1.company,
            requiredTesters: 3,
        });

        const task4 = await Task.create({
            appName: 'Fitness Tracker App',
            appUrl: 'https://fitness.example.com',
            testingLevel: 'basic',
            testTypes: ['functional', 'compatibility'],
            budget: 200,
            credits: 200,
            deadline: new Date('2024-02-10'),
            status: 'completed',
            progress: 100,
            developer: developer1._id,
            developerName: developer1.name,
            developerCompany: developer1.company,
            assignedTesters: [tester2._id, tester3._id],
            requiredTesters: 2,
            appliedTesters: 2,
        });

        const task5 = await Task.create({
            appName: 'Travel Booking App',
            appUrl: 'https://travel.example.com',
            testingLevel: 'intermediate',
            testTypes: ['functional', 'performance'],
            budget: 400,
            credits: 400,
            deadline: new Date('2024-02-10'),
            status: 'under-verification',
            progress: 100,
            developer: developer2._id,
            developerName: developer2.name,
            developerCompany: developer2.company,
            assignedTesters: [tester1._id, tester2._id, tester5._id],
            requiredTesters: 3,
            appliedTesters: 3,
        });

        // Marketplace tasks (open)
        const task6 = await Task.create({
            appName: 'Healthcare Portal',
            appUrl: 'https://health.example.com',
            description: 'Comprehensive testing of patient data management system including HIPAA compliance verification.',
            testingLevel: 'expert',
            testTypes: ['security', 'accessibility', 'performance'],
            budget: 450,
            credits: 450,
            deadline: new Date('2024-02-18'),
            status: 'open',
            developer: developer3._id,
            developerName: developer3.name,
            developerCompany: developer3.company,
            requiredTesters: 5,
            appliedTesters: 2,
            estimatedTime: '4-6 hours',
        });

        const task7 = await Task.create({
            appName: 'Food Delivery App',
            appUrl: 'https://foodie.example.com',
            description: 'Test the new order tracking feature and payment integration across iOS and Android.',
            testingLevel: 'intermediate',
            testTypes: ['functional', 'usability'],
            budget: 250,
            credits: 250,
            deadline: new Date('2024-02-12'),
            status: 'open',
            developer: developer2._id,
            developerName: developer2.name,
            developerCompany: developer2.company,
            requiredTesters: 3,
            appliedTesters: 1,
            estimatedTime: '2-3 hours',
        });

        const task8 = await Task.create({
            appName: 'Learning Management System',
            appUrl: 'https://lms.example.com',
            description: 'Test course enrollment, video playback, and quiz functionality on multiple browsers.',
            testingLevel: 'basic',
            testTypes: ['functional', 'compatibility'],
            budget: 150,
            credits: 150,
            deadline: new Date('2024-02-08'),
            status: 'open',
            developer: developer3._id,
            developerName: developer3.name,
            developerCompany: developer3.company,
            requiredTesters: 4,
            appliedTesters: 3,
            estimatedTime: '1-2 hours',
        });

        const task9 = await Task.create({
            appName: 'Real Estate Platform',
            appUrl: 'https://homes.example.com',
            description: 'Test property search, virtual tour feature, and mortgage calculator.',
            testingLevel: 'intermediate',
            testTypes: ['functional', 'usability', 'performance'],
            budget: 300,
            credits: 300,
            deadline: new Date('2024-02-20'),
            status: 'open',
            developer: developer3._id,
            developerName: developer3.name,
            developerCompany: developer3.company,
            requiredTesters: 3,
            appliedTesters: 0,
            estimatedTime: '3-4 hours',
        });

        console.log('Created tasks');

        // ============ Create Feedback ============
        await Feedback.create({
            task: task2._id,
            taskName: 'Banking Dashboard',
            tester: tester1._id,
            testerName: 'Sarah Tester',
            testerRating: 4.9,
            status: 'pending',
            proofType: 'video',
            proofUrl: '/proofs/banking-test.mp4',
            observations: 'Found 3 critical security vulnerabilities in the login flow. Session tokens are not properly invalidated on logout.',
            testResult: 'issues-found',
            aiVerification: 'verified',
            creditScore: 95,
        });

        await Feedback.create({
            task: task2._id,
            taskName: 'Banking Dashboard',
            tester: tester2._id,
            testerName: 'Mike QA',
            testerRating: 4.7,
            status: 'approved',
            proofType: 'screenshots',
            proofUrl: '/proofs/banking-screenshots.zip',
            observations: 'Accessibility issues found: missing alt tags, low contrast ratios on warning buttons.',
            testResult: 'issues-found',
            aiVerification: 'verified',
            creditScore: 88,
        });

        await Feedback.create({
            task: task1._id,
            taskName: 'E-Commerce Mobile App',
            tester: tester3._id,
            testerName: 'Lisa QA',
            testerRating: 4.5,
            status: 'needs-revision',
            proofType: 'video',
            proofUrl: '/proofs/ecommerce-test.mp4',
            observations: 'Checkout flow tested. Minor UI glitches on mobile landscape mode.',
            testResult: 'pass',
            aiVerification: 'low-quality',
            creditScore: 62,
        });

        console.log('Created feedback');

        // ============ Create Transactions ============
        await Transaction.create({
            user: tester1._id,
            userName: 'Sarah Tester',
            userType: 'tester',
            type: 'credit',
            amount: 180,
            description: 'Payment for E-Commerce testing',
            taskName: 'E-Commerce Mobile App',
            status: 'completed',
        });

        await Transaction.create({
            user: developer1._id,
            userName: 'John Developer',
            userType: 'developer',
            type: 'debit',
            amount: 500,
            description: 'Task creation fee',
            taskName: 'E-Commerce Mobile App',
            status: 'completed',
        });

        await Transaction.create({
            user: admin._id,
            userName: 'Platform',
            userType: 'admin',
            type: 'commission',
            amount: 50,
            description: 'Commission earned',
            taskName: 'Banking Dashboard',
            status: 'completed',
        });

        await Transaction.create({
            user: tester2._id,
            userName: 'Mike QA',
            userType: 'tester',
            type: 'credit',
            amount: 220,
            description: 'Payment for Banking Dashboard',
            taskName: 'Banking Dashboard',
            status: 'completed',
        });

        await Transaction.create({
            user: tester5._id,
            userName: 'Anna Beta',
            userType: 'tester',
            type: 'withdrawal',
            amount: 1000,
            description: 'Withdrawal request',
            taskName: null,
            status: 'pending',
        });

        await Transaction.create({
            user: developer4._id,
            userName: 'Maria Garcia',
            userType: 'developer',
            type: 'refund',
            amount: 150,
            description: 'Cancelled task refund',
            taskName: 'Cancelled Task',
            status: 'completed',
        });

        console.log('Created transactions');

        console.log('\n--- Seed Complete ---');
        console.log('Login credentials (all accounts): Password123');
        console.log('\nDeveloper:  john@devcompany.com');
        console.log('Tester:     sarah@testing.com');
        console.log('Admin:      admin@testflow.com');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
