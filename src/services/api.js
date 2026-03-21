// API Service Layer — centralized API client for backend communication

const API_BASE = '/api';

// Get stored auth token
function getToken() {
    return localStorage.getItem('testflow_token');
}

// Core fetch wrapper with auth headers and error handling
async function request(endpoint, options = {}) {
    const token = getToken();
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    // Handle 401 — token expired or invalid
    if (res.status === 401) {
        localStorage.removeItem('testflow_token');
        localStorage.removeItem('testflow_user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
    }

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
    }

    return data;
}

// ============ Auth API ============
export const authAPI = {
    register: (userData) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    login: (email, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    verifyOTP: (otp) =>
        request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ otp }),
        }),

    getMe: () => request('/auth/me'),
};

// ============ Tasks API ============
export const tasksAPI = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/tasks${query ? `?${query}` : ''}`);
    },

    getStats: () => request('/tasks/stats'),

    get: (id) => request(`/tasks/${id}`),

    create: (taskData) =>
        request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        }),

    update: (id, updates) =>
        request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }),

    marketplace: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/tasks/marketplace${query ? `?${query}` : ''}`);
    },

    myTasks: () => request('/tasks/my-tasks'),

    apply: (id) =>
        request(`/tasks/${id}/apply`, { method: 'POST' }),
};

// ============ Feedback API ============
export const feedbackAPI = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/feedback${query ? `?${query}` : ''}`);
    },

    submit: (feedbackData) =>
        request('/feedback', {
            method: 'POST',
            body: JSON.stringify(feedbackData),
        }),

    update: (id, updates) =>
        request(`/feedback/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }),
};

// ============ Users API ============
export const usersAPI = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/users${query ? `?${query}` : ''}`);
    },

    get: (id) => request(`/users/${id}`),

    update: (id, updates) =>
        request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }),

    stats: () => request('/users/stats'),
};

// ============ Transactions API ============
export const transactionsAPI = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/transactions${query ? `?${query}` : ''}`);
    },

    wallet: () => request('/transactions/wallet'),
};

// ============ Analytics API ============
export const analyticsAPI = {
    overview: () => request('/analytics/overview'),
};

export default {
    auth: authAPI,
    tasks: tasksAPI,
    feedback: feedbackAPI,
    users: usersAPI,
    transactions: transactionsAPI,
    analytics: analyticsAPI,
};
