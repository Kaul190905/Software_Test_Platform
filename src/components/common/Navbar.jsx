import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiBell } from 'react-icons/fi';
import { useState } from 'react';
import { getInitials } from '../../utils/helpers';
import NotificationModal from './NotificationModal';
import './Navbar.css';

function Navbar({ onMenuToggle, isSidebarOpen }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

    // Mock notifications
    const notifications = [
        { id: 1, title: 'Task Completed', message: 'Banking Dashboard testing completed', time: '5m ago', unread: true },
        { id: 2, title: 'New Feedback', message: 'You have new feedback from Sarah', time: '1h ago', unread: true },
        { id: 3, title: 'Payment Received', message: 'Payment of ₹500 processed', time: '3h ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;


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
                <button
                    className="navbar-icon-btn"
                    onClick={() => setIsNotificationModalOpen(true)}
                    aria-label="Notifications"
                >
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount}</span>
                    )}
                </button>

                {/* Profile display only */}
                <div className="navbar-profile-btn">
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
                </div>
            </div>

            <NotificationModal 
                isOpen={isNotificationModalOpen} 
                onClose={() => setIsNotificationModalOpen(false)} 
                notifications={notifications} 
            />
        </nav>
    );
}

export default Navbar;
