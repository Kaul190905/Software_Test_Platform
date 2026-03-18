import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock user data for different roles
const mockUsers = {
    developer: {
        id: 'dev-001',
        name: 'John Developer',
        email: 'john@devcompany.com',
        role: 'developer',
        avatar: null,
        company: 'TechCorp Inc.',
        joinedDate: '2024-01-15',
    },
    tester: {
        id: 'test-001',
        name: 'Sarah Tester',
        email: 'sarah@testing.com',
        role: 'tester',
        avatar: null,
        rating: 4.8,
        completedTests: 156,
        walletBalance: 2450,
        joinedDate: '2023-11-20',
    },
    admin: {
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@testflow.com',
        role: 'admin',
        avatar: null,
        permissions: ['all'],
        joinedDate: '2023-01-01',
    },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // No session persistence per user request. 
        // Always land on the login page when the website is opened.
        setIsLoading(false);
    }, []);

    const login = async (email, password, role = 'developer') => {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock authentication - in real app, this would call an API
        const userData = mockUsers[role];
        if (!userData) {
            setIsLoading(false);
            throw new Error('Invalid role');
        }

        const userWithEmail = { ...userData, email };
        setUser(userWithEmail);
        setIsAuthenticated(true);
        setIsLoading(false);

        return userWithEmail;
    };

    const signup = async (userData) => {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock signup - returns user data for OTP verification
        const newUser = {
            id: `${userData.role}-${Date.now()}`,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: null,
            joinedDate: new Date().toISOString().split('T')[0],
            ...(userData.role === 'tester' && { walletBalance: 0, completedTests: 0, rating: 0 }),
            ...(userData.role === 'developer' && { company: userData.company || '' }),
        };

        setIsLoading(false);
        return newUser;
    };

    const verifyOTP = async (otp) => {
        setIsLoading(true);

        // Simulate OTP verification
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock OTP verification - any 6-digit code works
        if (otp.length !== 6) {
            setIsLoading(false);
            throw new Error('Invalid OTP');
        }

        setIsLoading(false);
        return true;
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
    };

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        verifyOTP,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
