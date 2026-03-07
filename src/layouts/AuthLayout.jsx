import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { FiZap } from 'react-icons/fi';
import './AuthLayout.css';

function AuthLayout() {
    const { isLoading, isAuthenticated, user } = useAuth();

    if (isLoading) {
        return <Loader fullScreen text="Loading..." />;
    }

    if (isAuthenticated && user) {
        // Redirect to appropriate dashboard based on role
        const dashboardPath = `/${user.role}/dashboard`;
        return <Navigate to={dashboardPath} replace />;
    }

    return (
        <div className="auth-layout">
            <div className="auth-sidebar">
                <div className="auth-sidebar-content">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <FiZap size={32} />
                        </div>
                        <span className="auth-logo-text">TestFlow</span>
                    </div>

                    <div className="auth-sidebar-hero">
                        <h1 className="auth-hero-title">
                            Software Testing<br />
                            <span className="gradient-text">Made Simple</span>
                        </h1>
                        <p className="auth-hero-text">
                            Connect with professional testers, get comprehensive feedback,
                            and ship quality software faster than ever.
                        </p>
                    </div>

                    <div className="auth-features">
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🎯</div>
                            <div className="auth-feature-content">
                                <h4>Expert Testers</h4>
                                <p>Access a pool of vetted testing professionals</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🤖</div>
                            <div className="auth-feature-content">
                                <h4>AI-Powered Verification</h4>
                                <p>Automated proof validation and quality checks</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">💰</div>
                            <div className="auth-feature-content">
                                <h4>Fair Credit System</h4>
                                <p>Transparent pricing with dynamic allocation</p>
                            </div>
                        </div>
                    </div>

                    <div className="auth-sidebar-footer">
                        <p>Trusted by <strong>500+</strong> companies worldwide</p>
                    </div>
                </div>

                <div className="auth-sidebar-bg">
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                </div>
            </div>

            <div className="auth-main">
                <div className="auth-form-container">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
