import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Fetch profile data from profiles table
    const fetchProfile = async (authUser) => {
        if (!authUser) return null;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error.message);
            return null;
        }
        return data;
    };

    // On mount, check for existing Supabase session
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const profile = await fetchProfile(session.user);
                    if (profile) {
                        setUser(profile);
                        setIsAuthenticated(true);
                    }
                }
            } catch (e) {
                console.error('Auth init error:', e);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await fetchProfile(session.user);
                    if (profile) {
                        setUser(profile);
                        setIsAuthenticated(true);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw new Error(error.message);

            const profile = await fetchProfile(data.user);
            if (!profile) throw new Error('Profile not found');

            if (profile.status === 'suspended') {
                await supabase.auth.signOut();
                throw new Error('Account suspended');
            }

            setUser(profile);
            setIsAuthenticated(true);
            setIsLoading(false);
            return profile;
        } catch (err) {
            setIsLoading(false);
            throw err;
        }
    };

    const signup = async (userData) => {
        setIsLoading(true);
        try {
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

            // Wait a moment for the trigger to create the profile
            await new Promise(resolve => setTimeout(resolve, 500));

            const profile = await fetchProfile(data.user);
            if (profile) {
                // Update profile with company if provided
                if (userData.company) {
                    await supabase.from('profiles').update({ company: userData.company }).eq('id', data.user.id);
                    profile.company = userData.company;
                }
                setUser(profile);
            }

            setIsLoading(false);
            return profile || { ...data.user, role: userData.role };
        } catch (err) {
            setIsLoading(false);
            throw err;
        }
    };

    const verifyOTP = async (otp) => {
        setIsLoading(true);
        try {
            // For now, any 6-digit code works (mock OTP)
            if (!otp || otp.length !== 6) {
                throw new Error('Invalid OTP. Must be 6 digits.');
            }

            // Mark user as verified
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ otp_verified: true, status: 'active' })
                    .eq('id', user.id);

                const updatedUser = { ...user, otp_verified: true, status: 'active' };
                setUser(updatedUser);
                setIsAuthenticated(true);
            }

            setIsLoading(false);
            return true;
        } catch (err) {
            setIsLoading(false);
            throw err;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
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
