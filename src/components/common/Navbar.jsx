import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiMenu,
    FiX,
    FiUser,
    FiLogOut,
    FiSettings,
    FiChevronDown
} from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { getInitials } from '../../utils/helpers';
import Notification from './Notification';
import './Navbar.css';

function Navbar({ onMenuToggle, isSidebarOpen }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleLabel = (role) => {
        const labels = {
            developer: 'Developer',
            tester: 'Tester',
            admin: 'Administrator'
        };
        return labels[role] || role;
    };

    // Get current page title
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('create-task')) return 'Create Task';
        if (path.includes('marketplace')) return 'Task Marketplace';
        if (path.includes('users')) return 'User Management';
        if (path.includes('analytics')) return 'Analytics';
        if (path.includes('payment')) return 'Payment';
        if (path.includes('feedback')) return 'Feedback';
        if (path.includes('proof')) return 'Proof Submission';
        if (path.includes('wallet')) return 'Wallet';
        return 'Dashboard';
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button
                    className="navbar-menu-btn"
                    onClick={onMenuToggle}
                    aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                    {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>

                <div className="navbar-breadcrumb">
                    <span className="navbar-page-title">{getPageTitle()}</span>
                </div>
            </div>

            <div className="navbar-right">
                {/* Notifications */}
                <Notification />

                {/* Profile Dropdown */}
                <div className="navbar-dropdown" ref={profileRef}>
                    <button
                        className="navbar-profile-btn"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="avatar sm">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                getInitials(user?.name || 'User')
                            )}
                        </div>
                        <div className="navbar-profile-info">
                            <span className="navbar-profile-name">{user?.name || 'User'}</span>
                            <span className="navbar-profile-role">{getRoleLabel(user?.role)}</span>
                        </div>
                        <FiChevronDown size={16} className={isProfileOpen ? 'rotated' : ''} />
                    </button>

                    {isProfileOpen && (
                        <div className="dropdown-menu profile-menu open">
                            <div className="dropdown-user-info">
                                <div className="avatar lg">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} />
                                    ) : (
                                        getInitials(user?.name || 'User')
                                    )}
                                </div>
                                <div>
                                    <p className="dropdown-user-name">{user?.name}</p>
                                    <p className="dropdown-user-email">{user?.email}</p>
                                </div>
                            </div>
                            <div className="dropdown-divider" />
                            <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                <FiUser size={16} />
                                <span>Profile</span>
                            </Link>
                            <Link to="/settings" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                <FiSettings size={16} />
                                <span>Settings</span>
                            </Link>
                            <div className="dropdown-divider" />
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <FiLogOut size={16} />
                                <span>Log out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
