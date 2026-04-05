import { Outlet, Navigate, Link } from 'react-router-dom';
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
        <div className="auth-split-layout">
            <div className="auth-brand-panel">
                <div className="auth-brand-content">
                    <Link to="/" className="auth-logo">
                        <div className="auth-logo-icon">
                            <FiZap size={32} />
                        </div>
                        <span className="auth-logo-text">TestFlow</span>
                    </Link>

                    <div className="auth-brand-hero">
                        <h1 className="auth-hero-title">
                            Software Testing,<br />
                            <span className="gradient-text">Made Simple.</span>
                        </h1>
                        <p className="auth-hero-text">
                            Connect with professional testers, get comprehensive feedback,
                            and ship quality software faster than ever.
                        </p>
                    </div>
                </div>
            </div>

            <div className="auth-form-panel">
                <div className="auth-form-container">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
