// API Service Layer — Supabase client for backend communication
import supabase from '../lib/supabase';

// ============ Auth API ============
// Auth is handled directly via supabase.auth in AuthContext
// These are kept as thin wrappers for any component that imports authAPI directly
export const authAPI = {
    register: async (userData) => {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    name: userData.name,
                    role: userData.role || 'developer',
                    company: userData.company || '',
                },
            },
        });
        if (error) throw new Error(error.message);
        return { user: data.user, session: data.session };
    },

    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw new Error(error.message);
        return { user: data.user, session: data.session };
    },

    getMe: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw new Error(error.message);
        if (!user) throw new Error('Not authenticated');

        // Get profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profileError) throw new Error(profileError.message);
        return { user: profile };
    },
};

// ============ Tasks API ============
export const tasksAPI = {
    list: async (params = {}) => {
        let query = supabase.from('tasks').select('*, profiles!tasks_developer_id_fkey(name, email, company)');

        if (params.status && params.status !== 'all') {
            query = query.eq('status', params.status);
        }
        if (params.search) {
            query = query.ilike('app_name', `%${params.search}%`);
        }

        // Automatically filter by developer_id for developers to enforce privacy
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            const userRole = (profile?.role || '').toLowerCase();
            if (userRole === 'developer') {
                query = query.eq('developer_id', user.id);
            }
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw new Error(error.message);

        // Get assigned testers for each task
        const taskIds = data.map(t => t.id);
        let testerData = [];
        if (taskIds.length > 0) {
            const { data: td } = await supabase
                .from('task_testers')
                .select('task_id, tester_id, profiles(name, email)')
                .in('task_id', taskIds);
            testerData = td || [];
        }

        // Map testers to tasks and format
        const tasks = data.map(task => {
            const dev = task.profiles || {};
            const assignedTesters = (testerData || []).filter(tt => tt.task_id === task.id);
            return {
                _id: task.id,
                id: task.id,
                appName: task.app_name,
                appUrl: task.app_url,
                description: task.description,
                testingLevel: task.testing_level,
                testTypes: task.test_types || [],
                budget: task.budget,
                credits: task.credits,
                deadline: task.deadline,
                status: task.status,
                progress: task.progress,
                developer: { name: dev.name, email: dev.email, company: dev.company },
                developerName: task.developer_name,
                developerCompany: task.developer_company,
                assignedTesters: assignedTesters.map(tt => tt.profiles),
                testersAssigned: assignedTesters.length,
                requiredTesters: task.required_testers,
                appliedTesters: task.applied_testers,
                openSlots: Math.max(0, task.required_testers - assignedTesters.length),
                estimatedTime: task.estimated_time,
                createdAt: task.created_at,
                updatedAt: task.updated_at,
            };
        });

        return { tasks };
    },

    getStats: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const userRole = (profile?.role || '').toLowerCase();

        if (userRole === 'developer') {
            const { data: myTasks } = await supabase
                .from('tasks')
                .select('id, status, budget')
                .eq('developer_id', user.id);

            const tasks = myTasks || [];
            const active = tasks.filter(t => ['open', 'in-progress'].includes(t.status)).length;
            const completed = tasks.filter(t => t.status === 'completed').length;
            const totalBudget = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);

            let feedbackCount = 0;
            if (tasks.length > 0) {
                const { count } = await supabase
                    .from('feedback')
                    .select('*', { count: 'exact', head: true })
                    .in('task_id', tasks.map(t => t.id));
                feedbackCount = count || 0;
            }

            return {
                activeProjects: active,
                completedProjects: completed,
                totalBudgetSpent: totalBudget,
                feedbackReceived: feedbackCount,
                activeProjectsChange: 8.5,
                completedProjectsChange: 12.3,
            };
        } else if (userRole === 'tester') {
            const { count: activeTests } = await supabase
                .from('task_testers')
                .select('*', { count: 'exact', head: true })
                .eq('tester_id', user.id);

            return {
                walletBalance: profile.wallet_balance || 0,
                availableCredits: profile.wallet_balance || 0,
                pendingCredits: profile.pending_credits || 0,
                completedTests: profile.completed_tests || 0,
                completedTasks: profile.completed_tests || 0,
                activeTests: activeTests || 0,
                rating: profile.rating || 0,
                reviewCount: profile.review_count || 0,
                totalEarnings: profile.total_earnings || 0,
            };
        } else {
            // Admin stats
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: totalDevelopers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'developer');
            const { count: totalTesters } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tester');
            const { count: activeTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).in('status', ['open', 'in-progress']);
            const { count: completedTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed');
            const { count: pendingVerifications } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending-review');

            // Total budget across all tasks
            const { data: budgetData } = await supabase.from('tasks').select('budget');
            const totalBudget = (budgetData || []).reduce((sum, t) => sum + (t.budget || 0), 0);

            return {
                totalUsers: totalUsers || 0,
                totalDevelopers: totalDevelopers || 0,
                totalTesters: totalTesters || 0,
                activeTasks: activeTasks || 0,
                completedTasks: completedTasks || 0,
                totalCreditsDistributed: totalBudget || 0,
                platformRevenue: (totalBudget || 0) * 0.1,
                pendingVerifications: pendingVerifications || 0,
                disputesPending: 0,
                usersChange: totalUsers > 0 ? 12.5 : 0,
                revenueChange: totalBudget > 0 ? 15.2 : 0,
            };
        }
    },

    get: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();
        let query = supabase
            .from('tasks')
            .select('*, profiles!tasks_developer_id_fkey(name, email, company)')
            .eq('id', id);

        if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            const userRole = (profile?.role || '').toLowerCase();
            if (userRole === 'developer') {
                query = query.eq('developer_id', user.id);
            }
        }

        const { data, error } = await query.single();

        if (error) throw new Error(error.message);

        const { data: testerData } = await supabase
            .from('task_testers')
            .select('tester_id, profiles(name, email, rating)')
            .eq('task_id', id);

        const dev = data.profiles || {};
        const assignedTesters = testerData || [];

        return {
            task: {
                _id: data.id,
                id: data.id,
                appName: data.app_name,
                appUrl: data.app_url,
                description: data.description,
                testingLevel: data.testing_level,
                testTypes: data.test_types || [],
                budget: data.budget,
                credits: data.credits,
                deadline: data.deadline,
                status: data.status,
                progress: data.progress,
                developer: { name: dev.name, email: dev.email, company: dev.company },
                developerName: data.developer_name,
                developerCompany: data.developer_company,
                company: data.developer_company || dev.company || '',
                companyName: data.developer_company || dev.company || '',
                level: data.testing_level ? data.testing_level.charAt(0).toUpperCase() + data.testing_level.slice(1) : '',
                assignedTesters: assignedTesters.map(tt => tt.profiles),
                testersAssigned: assignedTesters.length,
                requiredTesters: data.required_testers,
                appliedTesters: data.applied_testers,
                openSlots: Math.max(0, data.required_testers - assignedTesters.length),
                estimatedTime: data.estimated_time,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            },
        };
    },

    create: async (taskData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                app_name: taskData.appName,
                app_url: taskData.appUrl,
                description: taskData.description || '',
                testing_level: taskData.testingLevel,
                test_types: taskData.testTypes || [],
                budget: taskData.budget || 0,
                credits: taskData.credits || taskData.budget || 0,
                deadline: taskData.deadline,
                developer_id: user.id,
                required_testers: taskData.requiredTesters || 1,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return { task: data };
    },

    update: async (id, updates) => {
        const updateData = {};
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.progress !== undefined) updateData.progress = updates.progress;
        if (updates.appName !== undefined) updateData.app_name = updates.appName;
        if (updates.description !== undefined) updateData.description = updates.description;

        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { task: data };
    },

    marketplace: async (params = {}) => {
        // Get current user to exclude their already-accepted tasks
        const { data: { user } } = await supabase.auth.getUser();
        let myAcceptedTaskIds = [];
        if (user) {
            const { data: myTasks } = await supabase
                .from('task_testers')
                .select('task_id')
                .eq('tester_id', user.id);
            myAcceptedTaskIds = (myTasks || []).map(t => t.task_id);
        }

        let query = supabase
            .from('tasks')
            .select('*, profiles!tasks_developer_id_fkey(name, company)')
            .eq('status', 'open');

        if (params.level && params.level !== 'all') {
            query = query.eq('testing_level', params.level);
        }
        if (params.type && params.type !== 'all') {
            query = query.contains('test_types', [params.type]);
        }
        if (params.search) {
            query = query.ilike('app_name', `%${params.search}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw new Error(error.message);

        // Filter out tasks current tester has already accepted
        const availableData = data.filter(t => !myAcceptedTaskIds.includes(t.id));

        // Get tester counts
        const taskIds = availableData.map(t => t.id);
        let testerCounts = [];
        if (taskIds.length > 0) {
            const { data: tc } = await supabase
                .from('task_testers')
                .select('task_id')
                .in('task_id', taskIds);
            testerCounts = tc || [];
        }

        const tasks = availableData.map(task => {
            const dev = task.profiles || {};
            const appliedCount = (testerCounts || []).filter(tc => tc.task_id === task.id).length;
            return {
                _id: task.id,
                id: task.id,
                appName: task.app_name,
                appUrl: task.app_url,
                description: task.description,
                testingLevel: task.testing_level,
                level: task.testing_level ? task.testing_level.charAt(0).toUpperCase() + task.testing_level.slice(1) : '',
                testTypes: task.test_types || [],
                credits: task.credits || task.budget,
                budget: task.budget,
                deadline: task.deadline,
                status: task.status,
                company: task.developer_company || dev.company || '',
                companyName: task.developer_company || dev.company || '',
                requiredTesters: task.required_testers,
                appliedTesters: appliedCount,
                openSlots: Math.max(0, task.required_testers - appliedCount),
                estimatedTime: task.estimated_time,
                postedAt: task.created_at,
                createdAt: task.created_at,
            };
        });

        return { tasks };
    },

    myTasks: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: assignments, error } = await supabase
            .from('task_testers')
            .select('task_id, created_at, tasks(*, profiles!tasks_developer_id_fkey(name, company))')
            .eq('tester_id', user.id);

        if (error) throw new Error(error.message);

        const tasks = (assignments || []).map(a => {
            const task = a.tasks;
            if (!task) return null;
            const dev = task.profiles || {};
            return {
                _id: task.id,
                id: task.id,
                taskId: task.id,
                appName: task.app_name,
                appUrl: task.app_url,
                description: task.description,
                testingLevel: task.testing_level,
                testTypes: task.test_types || [],
                credits: task.credits || task.budget,
                budget: task.budget,
                deadline: task.deadline,
                status: task.status,
                progress: task.progress,
                company: task.developer_company || dev.company || '',
                acceptedAt: a.created_at,
                createdAt: task.created_at,
            };
        }).filter(Boolean);

        return { tasks };
    },

    apply: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Insert into task_testers
        const { error } = await supabase
            .from('task_testers')
            .insert({ task_id: id, tester_id: user.id });

        if (error) {
            if (error.code === '23505') throw new Error('Already applied to this task');
            throw new Error(error.message);
        }

        // Check if task is now full and update status
        const { data: task } = await supabase.from('tasks').select('required_testers').eq('id', id).single();
        const { count } = await supabase.from('task_testers').select('*', { count: 'exact', head: true }).eq('task_id', id);

        const updates = { applied_testers: count };
        if (count >= (task?.required_testers || 1)) {
            updates.status = 'in-progress';
        }

        await supabase.from('tasks').update(updates).eq('id', id);

        return { message: 'Successfully applied to task' };
    },
};

// ============ Feedback API ============
export const feedbackAPI = {
    list: async (params = {}) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        let query = supabase.from('feedback').select('*');

        const userRole = (profile?.role || '').toLowerCase();

        if (userRole === 'developer') {
            // Get tasks owned by developer
            const { data: tasks } = await supabase
                .from('tasks')
                .select('id')
                .eq('developer_id', user.id);
            const taskIds = (tasks || []).map(t => t.id);
            if (taskIds.length > 0) {
                query = query.in('task_id', taskIds);
            } else {
                return { feedback: [] };
            }
        } else if (userRole === 'tester') {
            query = query.eq('tester_id', user.id);
        }

        if (params.status && params.status !== 'all') {
            query = query.eq('status', params.status);
        }
        if (params.taskId) {
            query = query.eq('task_id', params.taskId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw new Error(error.message);

        const feedback = (data || []).map(fb => ({
            _id: fb.id,
            id: fb.id,
            task: fb.task_id,
            taskId: fb.task_id,
            taskName: fb.task_name || 'Unlabeled Task',
            tester: fb.tester_id,
            testerName: fb.tester_name || 'Anonymous Tester',
            testerRating: fb.tester_rating || 5.0,
            proofType: fb.proof_type,
            proofUrl: fb.proof_url,
            observations: fb.observations,
            testResult: fb.test_result,
            stepsToReproduce: fb.steps_to_reproduce,
            status: fb.status || 'pending',
            aiVerification: fb.ai_verification || 'pending',
            creditScore: fb.credit_score || 0,
            submittedAt: fb.created_at,
            createdAt: fb.created_at,
        }));

        return { feedback };
    },

    getByTask: async (taskId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .eq('task_id', taskId)
            .eq('tester_id', user.id)
            .maybeSingle();

        if (error) throw new Error(error.message);
        
        if (!data) return { feedback: null };

        return {
            feedback: {
                id: data.id,
                taskId: data.task_id,
                taskName: data.task_name,
                testerId: data.tester_id,
                status: data.status,
                observations: data.observations,
                stepsToReproduce: data.steps_to_reproduce,
                proofUrl: data.proof_url,
                testResult: data.test_result,
                submittedAt: data.created_at,
            }
        };
    },

    submit: async (feedbackData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

        // Get task name
        const taskId = feedbackData.taskId || feedbackData.task;
        const { data: task } = await supabase
            .from('tasks')
            .select('app_name')
            .eq('id', taskId)
            .single();

        const { data, error } = await supabase
            .from('feedback')
            .insert({
                task_id: taskId,
                task_name: task?.app_name || 'Assigned Task',
                tester_id: user.id,
                observations: feedbackData.observations,
                steps_to_reproduce: feedbackData.stepsToReproduce || '',
                proof_type: feedbackData.proofType || 'screenshot',
                proof_url: feedbackData.proofUrl || '',
                test_result: feedbackData.testResult || 'pass',
                // Optional columns handled safely
                ...(profile?.name ? { tester_name: profile.name } : {}),
                ai_verification: 'pending',
                credit_score: feedbackData.testResult === 'pass' ? 95 : (Math.floor(Math.random() * 40) + 60),
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Update task status - if needed. For now we keep it simple, 
        // but arguably it should only change if task is fully completed.
        // await supabase.from('tasks').update({ status: 'pending-review', progress: 100 }).eq('id', taskId);

        return { feedback: data };
    },

    update: async (id, updates) => {
        const updateData = {};
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.aiVerification !== undefined) updateData.ai_verification = updates.aiVerification;

        const { data, error } = await supabase
            .from('feedback')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        // If approved, credit the tester
        if (updates.status === 'approved') {
            const { data: fb } = await supabase.from('feedback').select('tester_id, credit_score, task_id').eq('id', id).single();
            if (fb) {
                const creditAmount = (fb.credit_score || 0) * 3;
                const { data: tester } = await supabase.from('profiles').select('wallet_balance, total_earnings, completed_tests').eq('id', fb.tester_id).single();
                if (tester) {
                    await supabase.from('profiles').update({
                        wallet_balance: (tester.wallet_balance || 0) + creditAmount,
                        total_earnings: (tester.total_earnings || 0) + creditAmount,
                        completed_tests: (tester.completed_tests || 0) + 1,
                    }).eq('id', fb.tester_id);

                    // Record the credit transfer transaction for the tester
                    await transactionsAPI.record({
                        userId: fb.tester_id,
                        userName: tester.name,
                        userType: 'tester',
                        type: 'earning',
                        amount: creditAmount,
                        description: `Earnings for feedback approval`,
                        taskName: updates.taskName || 'Task Feedback',
                        status: 'completed'
                    });
                }

                // Check if all feedback approved → mark task completed
                const { data: allFb } = await supabase.from('feedback').select('status').eq('task_id', fb.task_id);
                if (allFb && allFb.every(f => f.status === 'approved')) {
                    await supabase.from('tasks').update({ status: 'completed' }).eq('id', fb.task_id);
                }
            }
        } else if (updates.status === 'needs-revision') {
            // Revert task status to in-progress if it was under review
            const { data: fb } = await supabase.from('feedback').select('task_id').eq('id', id).single();
            if (fb) {
                await supabase.from('tasks').update({ status: 'in-progress' }).eq('id', fb.task_id);
            }
        }

        return { feedback: data };
    },
};

// ============ Users API ============
export const usersAPI = {
    list: async (params = {}) => {
        let query = supabase.from('profiles').select('*');

        if (params.role && params.role !== 'all') {
            query = query.eq('role', params.role);
        }
        if (params.status && params.status !== 'all') {
            query = query.eq('status', params.status);
        }
        if (params.search) {
            query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw new Error(error.message);

        const users = (data || []).map(u => ({
            _id: u.id,
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            company: u.company,
            completedTasks: u.role === 'tester' ? (u.completed_tests || 0) : (u.tasks_created || 0),
            credits: u.role === 'tester' ? (u.total_earnings || 0) : (u.total_spent || 0),
            joinedAt: u.created_at,
            createdAt: u.created_at,
            bio: u.bio,
            experience: u.experience,
            skills: u.skills,
        }));

        return { users };
    },

    get: async (id) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return { user: data };
    },

    update: async (id, updates) => {
        const updateData = {};
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.email !== undefined) updateData.email = updates.email;
        if (updates.role !== undefined) updateData.role = updates.role;
        if (updates.company !== undefined) updateData.company = updates.company;
        if (updates.bio !== undefined) updateData.bio = updates.bio;

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { user: data };
    },

    stats: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error) throw new Error(error.message);
        return { user: data };
    },
};

// ============ Transactions API ============
export const transactionsAPI = {
    list: async (params = {}) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

        let query = supabase.from('transactions').select('*');

        // Non-admin only see own
        if (profile?.role !== 'admin') {
            query = query.eq('user_id', user.id);
        }

        if (params.type && params.type !== 'all') query = query.eq('type', params.type);
        if (params.status && params.status !== 'all') query = query.eq('status', params.status);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw new Error(error.message);

        const transactions = (data || []).map(t => ({
            _id: t.id,
            id: t.id,
            type: t.type,
            user: t.user_name || 'Unknown',
            userName: t.user_name || 'Unknown',
            userType: t.user_type || 'tester',
            amount: t.amount,
            description: t.description,
            taskName: t.task_name,
            timestamp: t.created_at,
            status: t.status,
        }));

        return { transactions };
    },

    wallet: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance, pending_credits, total_earnings')
            .eq('id', user.id)
            .single();

        const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        const transactions = (txData || []).map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            taskName: t.task_name,
            timestamp: t.created_at,
            status: t.status,
        }));

        return {
            balance: profile?.wallet_balance || 0,
            pendingCredits: profile?.pending_credits || 0,
            totalEarnings: profile?.total_earnings || 0,
            transactions,
        };
    },

    record: async (txData) => {
        // Use provided userId or fall back to current authenticated user
        let targetUserId = txData.userId;
        let targetUserName = txData.userName;
        let targetUserType = txData.userType;

        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');
            targetUserId = user.id;

            const { data: profile } = await supabase
                .from('profiles')
                .select('name, role')
                .eq('id', targetUserId)
                .single();
            
            targetUserName = profile?.name;
            targetUserType = profile?.role;
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                user_id: targetUserId,
                user_name: targetUserName || 'Unknown',
                user_type: targetUserType || 'tester',
                type: txData.type || 'payment',
                amount: txData.amount,
                description: txData.description,
                task_name: txData.taskName,
                status: txData.status || 'completed',
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { transaction: data };
    },
};

// ============ Analytics API ============
export const analyticsAPI = {
    overview: async () => {
        // Fetch admin stats
        const stats = await tasksAPI.getStats();

        return {
            stats,
            tasksOverTime: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    { label: 'Tasks Created', data: [45, 52, 68, 74, 82, 89], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)' },
                    { label: 'Tasks Completed', data: [38, 45, 58, 65, 72, 78], borderColor: '#14b8a6', backgroundColor: 'rgba(20, 184, 166, 0.1)' },
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
    },
};

export default {
    auth: authAPI,
    tasks: tasksAPI,
    feedback: feedbackAPI,
    users: usersAPI,
    transactions: transactionsAPI,
    analytics: analyticsAPI,
};
