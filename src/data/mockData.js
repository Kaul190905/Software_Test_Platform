// Mock Data for Software Testing Platform

// ============ Developer Data ============

export const developerStats = {
    activeProjects: 12,
    completedProjects: 45,
    totalBudgetSpent: 15750,
    feedbackReceived: 38,
    activeProjectsChange: 8.5,
    completedProjectsChange: 12.3,
};

export const developerTasks = [
    {
        id: 'task-001',
        appName: 'E-Commerce Mobile App',
        appUrl: 'https://shop.example.com',
        testingLevel: 'expert',
        testTypes: ['functional', 'usability', 'security'],
        budget: 500,
        deadline: '2024-02-15',
        status: 'in-progress',
        progress: 65,
        testersAssigned: 3,
        createdAt: '2024-01-20',
    },
    {
        id: 'task-002',
        appName: 'Banking Dashboard',
        appUrl: 'https://bank.example.com',
        testingLevel: 'expert',
        testTypes: ['security', 'performance', 'accessibility'],
        budget: 750,
        deadline: '2024-02-20',
        status: 'pending-review',
        progress: 100,
        testersAssigned: 5,
        createdAt: '2024-01-18',
    },
    {
        id: 'task-003',
        appName: 'Social Media Platform',
        appUrl: 'https://social.example.com',
        testingLevel: 'intermediate',
        testTypes: ['functional', 'usability'],
        budget: 350,
        deadline: '2024-02-25',
        status: 'open',
        progress: 0,
        testersAssigned: 0,
        createdAt: '2024-01-25',
    },
    {
        id: 'task-004',
        appName: 'Fitness Tracker App',
        appUrl: 'https://fitness.example.com',
        testingLevel: 'basic',
        testTypes: ['functional', 'compatibility'],
        budget: 200,
        deadline: '2024-02-10',
        status: 'completed',
        progress: 100,
        testersAssigned: 2,
        createdAt: '2024-01-10',
    },
];

export const developerFeedback = [
    {
        id: 'fb-001',
        taskId: 'task-002',
        taskName: 'Banking Dashboard',
        testerName: 'Sarah Tester',
        testerRating: 4.9,
        submittedAt: '2024-02-01',
        status: 'pending',
        proofType: 'video',
        proofUrl: '/proofs/banking-test.mp4',
        observations: 'Found 3 critical security vulnerabilities in the login flow. Session tokens are not properly invalidated on logout.',
        testResult: 'issues-found',
        aiVerification: 'verified',
        creditScore: 95,
    },
    {
        id: 'fb-002',
        taskId: 'task-002',
        taskName: 'Banking Dashboard',
        testerName: 'Mike QA',
        testerRating: 4.7,
        submittedAt: '2024-02-02',
        status: 'approved',
        proofType: 'screenshots',
        proofUrl: '/proofs/banking-screenshots.zip',
        observations: 'Accessibility issues found: missing alt tags, low contrast ratios on warning buttons.',
        testResult: 'issues-found',
        aiVerification: 'verified',
        creditScore: 88,
    },
    {
        id: 'fb-003',
        taskId: 'task-001',
        taskName: 'E-Commerce Mobile App',
        testerName: 'Lisa QA',
        testerRating: 4.5,
        submittedAt: '2024-02-03',
        status: 'needs-revision',
        proofType: 'video',
        proofUrl: '/proofs/ecommerce-test.mp4',
        observations: 'Checkout flow tested. Minor UI glitches on mobile landscape mode.',
        testResult: 'pass',
        aiVerification: 'low-quality',
        creditScore: 62,
    },
];

// ============ Tester Data ============

export const testerStats = {
    walletBalance: 2450,
    availableCredits: 2450,
    pendingCredits: 350,
    completedTests: 156,
    completedTasks: 156,
    activeTests: 4,
    rating: 4.8,
    reviewCount: 142,
    totalEarnings: 12500,
};

export const availableTasks = [
    {
        id: 'market-001',
        appName: 'Healthcare Portal',
        appUrl: 'https://health.example.com',
        company: 'MedTech Solutions',
        companyName: 'MedTech Solutions',
        testingLevel: 'expert',
        level: 'Expert',
        testTypes: ['security', 'accessibility', 'performance'],
        credits: 450,
        deadline: '2024-02-18',
        description: 'Comprehensive testing of patient data management system including HIPAA compliance verification.',
        requiredTesters: 5,
        appliedTesters: 2,
        openSlots: 3,
        estimatedTime: '4-6 hours',
        postedAt: '2024-01-28',
    },
    {
        id: 'market-002',
        appName: 'Food Delivery App',
        appUrl: 'https://foodie.example.com',
        company: 'QuickEats Inc.',
        companyName: 'QuickEats Inc.',
        testingLevel: 'intermediate',
        level: 'Intermediate',
        testTypes: ['functional', 'usability'],
        credits: 250,
        deadline: '2024-02-12',
        description: 'Test the new order tracking feature and payment integration across iOS and Android.',
        requiredTesters: 3,
        appliedTesters: 1,
        openSlots: 2,
        estimatedTime: '2-3 hours',
        postedAt: '2024-01-30',
    },
    {
        id: 'market-003',
        appName: 'Learning Management System',
        appUrl: 'https://lms.example.com',
        company: 'EduPro',
        companyName: 'EduPro',
        testingLevel: 'basic',
        level: 'Basic',
        testTypes: ['functional', 'compatibility'],
        credits: 150,
        deadline: '2024-02-08',
        description: 'Test course enrollment, video playback, and quiz functionality on multiple browsers.',
        requiredTesters: 4,
        appliedTesters: 3,
        openSlots: 1,
        estimatedTime: '1-2 hours',
        postedAt: '2024-01-29',
    },
    {
        id: 'market-004',
        appName: 'Real Estate Platform',
        appUrl: 'https://homes.example.com',
        company: 'PropertyHub',
        companyName: 'PropertyHub',
        testingLevel: 'intermediate',
        level: 'Intermediate',
        testTypes: ['functional', 'usability', 'performance'],
        credits: 300,
        deadline: '2024-02-20',
        description: 'Test property search, virtual tour feature, and mortgage calculator.',
        requiredTesters: 3,
        appliedTesters: 0,
        openSlots: 3,
        estimatedTime: '3-4 hours',
        postedAt: '2024-01-31',
    },
];

export const testerActiveTasks = [
    {
        id: 'active-001',
        taskId: 'task-001',
        appName: 'E-Commerce Mobile App',
        company: 'TechCorp Inc.',
        testTypes: ['functional', 'usability'],
        credits: 180,
        deadline: '2024-02-15',
        acceptedAt: '2024-01-25',
        status: 'in-progress',
        aiStatus: 'pending',
        progress: 40,
    },
    {
        id: 'active-002',
        taskId: 'task-005',
        appName: 'Travel Booking App',
        company: 'Wanderlust Co.',
        testTypes: ['functional', 'performance'],
        credits: 220,
        deadline: '2024-02-10',
        acceptedAt: '2024-01-22',
        status: 'under-verification',
        aiStatus: 'verified',
        progress: 100,
    },
];

// ============ Admin Data ============

export const adminStats = {
    totalUsers: 801,
    totalDevelopers: 234,
    totalTesters: 567,
    activeTasks: 89,
    completedTasks: 1245,
    totalCreditsDistributed: 125000,
    platformRevenue: 18750,
    pendingVerifications: 12,
    disputesPending: 5,
    usersChange: 8.5,
    revenueChange: 12.3,
};

// Combined user list for admin with role field
export const adminUsers = [
    { id: 'dev-001', name: 'John Developer', email: 'john@devcompany.com', role: 'developer', status: 'active', completedTasks: 15, credits: 7500, joinedAt: '2024-01-15' },
    { id: 'dev-002', name: 'Emily Chen', email: 'emily@startup.io', role: 'developer', status: 'active', completedTasks: 8, credits: 3200, joinedAt: '2024-01-20' },
    { id: 'test-001', name: 'Sarah Tester', email: 'sarah@testing.com', role: 'tester', status: 'active', completedTasks: 156, credits: 12500, joinedAt: '2023-11-20' },
    { id: 'test-002', name: 'Mike QA', email: 'mike@qa.net', role: 'tester', status: 'active', completedTasks: 98, credits: 7800, joinedAt: '2023-12-05' },
    { id: 'dev-003', name: 'Robert Wilson', email: 'robert@enterprise.com', role: 'developer', status: 'active', completedTasks: 25, credits: 12500, joinedAt: '2023-12-10' },
    { id: 'test-003', name: 'Lisa QA', email: 'lisa@qaexpert.com', role: 'tester', status: 'active', completedTasks: 67, credits: 5200, joinedAt: '2024-01-02' },
    { id: 'dev-004', name: 'Maria Garcia', email: 'maria@fintech.com', role: 'developer', status: 'suspended', completedTasks: 3, credits: 1500, joinedAt: '2024-02-01' },
    { id: 'test-005', name: 'Anna Beta', email: 'anna@betatest.com', role: 'tester', status: 'active', completedTasks: 203, credits: 16200, joinedAt: '2023-10-15' },
];

export const pendingUsers = [
    { 
        id: 'req-001', 
        name: 'David Test', 
        email: 'david@tester.io', 
        role: 'tester', 
        status: 'pending', 
        joinedAt: '2024-02-05',
        experience: '3 years in manual testing',
        skills: ['Functional', 'Usability'],
        bio: 'I am a passionate tester looking to help developers improve their apps.'
    },
    { 
        id: 'req-002', 
        name: 'Alex Dev', 
        email: 'alex@code.com', 
        role: 'developer', 
        status: 'pending', 
        joinedAt: '2024-02-06',
        company: 'Freelance',
        bio: 'React developer interested in high-quality QA for my projects.'
    },
    { 
        id: 'req-003', 
        name: 'Jessica QA', 
        email: 'jessica@quality.org', 
        role: 'tester', 
        status: 'pending', 
        joinedAt: '2024-02-07',
        experience: '5 years automation',
        skills: ['Selenium', 'Cypress', 'Performance'],
        bio: 'Expert in automation testing and performance optimization.'
    },
];

// Credit logs for admin dashboard
export const adminCreditLogs = [
    { id: 'log-001', type: 'credit', userName: 'Sarah Tester', amount: 180, description: 'Payment for E-Commerce testing', timestamp: '2024-02-05' },
    { id: 'log-002', type: 'debit', userName: 'John Developer', amount: 500, description: 'Task creation fee', timestamp: '2024-02-05' },
    { id: 'log-003', type: 'credit', userName: 'Platform', amount: 50, description: 'Commission earned', timestamp: '2024-02-04' },
    { id: 'log-004', type: 'credit', userName: 'Mike QA', amount: 220, description: 'Payment for Banking Dashboard', timestamp: '2024-02-04' },
    { id: 'log-005', type: 'debit', userName: 'Anna Beta', amount: 1000, description: 'Withdrawal request', timestamp: '2024-02-03' },
];

export const allUsers = {
    developers: [
        { id: 'dev-001', name: 'John Developer', email: 'john@devcompany.com', company: 'TechCorp Inc.', status: 'active', tasksCreated: 15, totalSpent: 7500, joinedAt: '2024-01-15' },
        { id: 'dev-002', name: 'Emily Chen', email: 'emily@startup.io', company: 'StartupXYZ', status: 'active', tasksCreated: 8, totalSpent: 3200, joinedAt: '2024-01-20' },
        { id: 'dev-003', name: 'Robert Wilson', email: 'robert@enterprise.com', company: 'Enterprise Solutions', status: 'active', tasksCreated: 25, totalSpent: 12500, joinedAt: '2023-12-10' },
        { id: 'dev-004', name: 'Maria Garcia', email: 'maria@fintech.com', company: 'FinTech Pro', status: 'suspended', tasksCreated: 3, totalSpent: 1500, joinedAt: '2024-02-01' },
    ],
    testers: [
        { id: 'test-001', name: 'Sarah Tester', email: 'sarah@testing.com', status: 'active', rating: 4.9, completedTests: 156, totalEarned: 12500, joinedAt: '2023-11-20' },
        { id: 'test-002', name: 'Mike QA', email: 'mike@qa.net', status: 'active', rating: 4.7, completedTests: 98, totalEarned: 7800, joinedAt: '2023-12-05' },
        { id: 'test-003', name: 'Lisa QA', email: 'lisa@qaexpert.com', status: 'active', rating: 4.5, completedTests: 67, totalEarned: 5200, joinedAt: '2024-01-02' },
        { id: 'test-004', name: 'David Test', email: 'david@tester.io', status: 'pending', rating: 0, completedTests: 0, totalEarned: 0, joinedAt: '2024-02-05' },
        { id: 'test-005', name: 'Anna Beta', email: 'anna@betatest.com', status: 'active', rating: 4.8, completedTests: 203, totalEarned: 16200, joinedAt: '2023-10-15' },
    ],
};

export const adminTasks = [
    ...developerTasks,
    {
        id: 'task-005',
        appName: 'Travel Booking App',
        developerName: 'Emily Chen',
        developerCompany: 'StartupXYZ',
        testingLevel: 'intermediate',
        testTypes: ['functional', 'performance'],
        budget: 400,
        deadline: '2024-02-10',
        status: 'under-verification',
        progress: 100,
        testersAssigned: 3,
        createdAt: '2024-01-15',
    },
];

export const creditLogs = [
    { id: 'log-001', type: 'credit', user: 'Sarah Tester', userType: 'tester', amount: 180, taskName: 'E-Commerce Mobile App', timestamp: '2024-02-05 14:30', status: 'completed' },
    { id: 'log-002', type: 'debit', user: 'John Developer', userType: 'developer', amount: 500, taskName: 'E-Commerce Mobile App', timestamp: '2024-02-05 14:28', status: 'completed' },
    { id: 'log-003', type: 'commission', user: 'Platform', userType: 'admin', amount: 50, taskName: 'Banking Dashboard', timestamp: '2024-02-04 16:45', status: 'completed' },
    { id: 'log-004', type: 'credit', user: 'Mike QA', userType: 'tester', amount: 220, taskName: 'Banking Dashboard', timestamp: '2024-02-04 16:42', status: 'completed' },
    { id: 'log-005', type: 'withdrawal', user: 'Anna Beta', userType: 'tester', amount: 1000, taskName: null, timestamp: '2024-02-03 10:15', status: 'pending' },
    { id: 'log-006', type: 'refund', user: 'Maria Garcia', userType: 'developer', amount: 150, taskName: 'Cancelled Task', timestamp: '2024-02-02 09:30', status: 'completed' },
];

export const analyticsData = {
    tasksOverTime: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Tasks Created',
                data: [45, 52, 68, 74, 82, 89],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
            {
                label: 'Tasks Completed',
                data: [38, 45, 58, 65, 72, 78],
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
            },
        ],
    },
    creditsDistribution: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [15000, 18500, 22000, 28000, 35000, 42000],
    },
    tasksByType: {
        labels: ['Functional', 'Security', 'Usability', 'Performance', 'Accessibility', 'Compatibility'],
        data: [35, 25, 20, 12, 5, 3],
    },
    platformRevenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [2250, 2775, 3300, 4200, 5250, 6300],
    },
};

// ============ Test Types ============

export const testTypes = [
    { id: 'functional', name: 'Functional Testing', description: 'Verify features work as expected' },
    { id: 'usability', name: 'Usability Testing', description: 'Evaluate user experience and interface' },
    { id: 'security', name: 'Security Testing', description: 'Identify vulnerabilities and security flaws' },
    { id: 'performance', name: 'Performance Testing', description: 'Test speed, scalability, and stability' },
    { id: 'accessibility', name: 'Accessibility Testing', description: 'Ensure compliance with a11y standards' },
    { id: 'compatibility', name: 'Compatibility Testing', description: 'Test across browsers and devices' },
];

export const testingLevels = [
    { id: 'basic', name: 'Basic', description: 'General functional testing', creditMultiplier: 1 },
    { id: 'intermediate', name: 'Intermediate', description: 'Detailed testing with edge cases', creditMultiplier: 1.5 },
    { id: 'expert', name: 'Expert', description: 'In-depth testing with security focus', creditMultiplier: 2 },
];

// ============ Status Mappings ============

export const taskStatusMap = {
    'open': { label: 'Open', color: 'info' },
    'in-progress': { label: 'In Progress', color: 'primary' },
    'pending-review': { label: 'Pending Review', color: 'warning' },
    'under-verification': { label: 'Under AI Verification', color: 'secondary' },
    'completed': { label: 'Completed', color: 'success' },
    'cancelled': { label: 'Cancelled', color: 'danger' },
};

export const aiVerificationStatusMap = {
    'pending': { label: 'Pending', color: 'warning' },
    'verified': { label: 'AI Verified', color: 'success' },
    'low-quality': { label: 'Low Quality', color: 'warning' },
    'rejected': { label: 'Rejected', color: 'danger' },
};

export const userStatusMap = {
    'active': { label: 'Active', color: 'success' },
    'pending': { label: 'Pending', color: 'warning' },
    'suspended': { label: 'Suspended', color: 'danger' },
    'inactive': { label: 'Inactive', color: 'secondary' },
};
