import { createContext, useContext, useState, useEffect, useRef } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Track whether login/signup is in progress to avoid onAuthStateChange races
    const loginInProgressRef = useRef(false);

    // Fetch profile data from profiles table
    const fetchProfile = async (authUser) => {
        if (!authUser) return null;
        try {
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
        } catch (e) {
            console.error('fetchProfile exception:', e);
            return null;
        }
    };

    // On mount, check for existing Supabase session
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                // 1. Try to get current session
                const { data, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Auth getSession error:', error.message);
                }

                const session = data?.session;

                if (session?.user && isMounted) {
                    const profile = await fetchProfile(session.user);
                    if (profile && isMounted) {
                        setUser(profile);
                        setIsAuthenticated(true);
                    }
                }
            } catch (e) {
                console.error('Auth init exception:', e);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // Skip if login/signup is being handled directly
                if (loginInProgressRef.current) return;

                console.log('Auth state change:', event, !!session);

                if (session?.user) {
                    const profile = await fetchProfile(session.user);
                    if (isMounted) {
                        if (profile) {
                            setUser(profile);
                            setIsAuthenticated(true);
                        } else {
                            // If profile fetch failed but session exists, 
                            // we might still want to end loading
                            console.warn('Session exists but profile fetch failed');
                        }
                        setIsLoading(false);
                    }
                } else {
                    // No session
                    if (isMounted) {
                        setUser(null);
                        setIsAuthenticated(false);
                        setIsLoading(false);
                    }
                }
            }
        );

        initAuth();

        // Safety timeout to ensure loading eventually stops
        const safetyTimeout = setTimeout(() => {
            if (isMounted && isLoading) {
                console.warn('Auth initialization took too long, forcing loading to stop');
                setIsLoading(false);
            }
        }, 5000);

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const login = async (email, password) => {
        loginInProgressRef.current = true;
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw new Error(error.message);

            const profile = await fetchProfile(data.user);
            if (!profile) throw new Error('Profile not found. Please contact support.');

            if (profile.status === 'suspended') {
                await supabase.auth.signOut();
                throw new Error('Account suspended');
            }

            setUser(profile);
            setIsAuthenticated(true);
            return profile;
        } catch (err) {
            throw err;
        } finally {
            setIsLoading(false);
            loginInProgressRef.current = false;
        }
    };

    const signup = async (userData) => {
        loginInProgressRef.current = true;
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
            await new Promise(resolve => setTimeout(resolve, 1000));

            const profile = await fetchProfile(data.user);
            if (profile) {
                // Update profile with company if provided
                if (userData.company) {
                    await supabase.from('profiles').update({ company: userData.company }).eq('id', data.user.id);
                    profile.company = userData.company;
                }
                setUser(profile);
            }

            return profile || { ...data.user, role: userData.role };
        } catch (err) {
            throw err;
        } finally {
            setIsLoading(false);
            loginInProgressRef.current = false;
        }
    };

    const verifyOTP = async (otp, email) => {
        setIsLoading(true);
        try {
            const targetEmail = email || user?.email;
            if (!targetEmail) throw new Error('Email is required for verification');

            const { data, error } = await supabase.auth.verifyOtp({
                email: targetEmail,
                token: otp,
                type: 'signup',
            });

            if (error) throw new Error(error.message);

            // Update profile status after successful OTP verification
            const profileId = data.user?.id || user?.id;
            if (profileId) {
                await supabase
                    .from('profiles')
                    .update({ otp_verified: true, status: 'active' })
                    .eq('id', profileId);

                // Fetch full profile to refresh state
                const profile = await fetchProfile(data.user || user);
                if (profile) {
                    setUser(profile);
                    setIsAuthenticated(true);
                }
            }

            return true;
        } catch (err) {
            console.error('OTP Verification Error:', err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Logout error:', e);
        }
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
