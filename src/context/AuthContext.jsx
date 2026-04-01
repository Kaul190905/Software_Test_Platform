import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // On mount, check for existing session via stored token
    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem('testflow_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (e) {
                localStorage.removeItem('testflow_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const data = await authAPI.login(email, password);
            const { user: userData, token } = data;

            localStorage.setItem('testflow_token', token);
            localStorage.setItem('testflow_user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
            setIsLoading(false);

            return userData;
        } catch (err) {
            setIsLoading(false);
            throw err;
        }

        const userWithEmail = { ...userData, email };
        setUser(userWithEmail);
        setIsAuthenticated(true);
        localStorage.setItem('testflow_user', JSON.stringify(userWithEmail));
        setIsLoading(false);

        return userWithEmail;
    };

    const signup = async (userData) => {
        setIsLoading(true);
        try {
            const data = await authAPI.register(userData);
            const { user: newUser, token } = data;

            // Store token so OTP verify call works
            localStorage.setItem('testflow_token', token);
            localStorage.setItem('testflow_user', JSON.stringify(newUser));
            setUser(newUser);
            setIsLoading(false);

            return newUser;
        } catch (err) {
            setIsLoading(false);
            throw err;
        }
    };

    const verifyOTP = async (otp) => {
        setIsLoading(true);
        try {
            const data = await authAPI.verifyOTP(otp);
            const verifiedUser = data.user;

            // Update stored user with verified status
            localStorage.setItem('testflow_user', JSON.stringify(verifiedUser));
            setUser(verifiedUser);
            setIsAuthenticated(true);
            setIsLoading(false);

            return true;
        } catch (err) {
            setIsLoading(false);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('testflow_user');
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
