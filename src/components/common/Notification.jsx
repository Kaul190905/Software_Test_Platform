import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/helpers';
import {
    FiBell,
    FiCheckCircle,
    FiAlertCircle,
    FiInfo,
    FiDollarSign,
    FiUser,
    FiFileText,
    FiClock,
    FiX,
    FiChevronDown
} from 'react-icons/fi';
import Button from './Button';
import Badge from './Badge';
import './Notification.css';

// Mock notification data for different user roles
const mockNotifications = {
    developer: [
        {
            id: 'dev-1',
            type: 'success',
            title: 'Task Completed',
            message: 'E-Commerce Mobile App testing has been completed by Sarah Tester',
            timestamp: '2024-02-05T10:30:00Z',
            read: false,
            actionUrl: '/developer/tasks',
            icon: FiCheckCircle
        },
        {
            id: 'dev-2',
            type: 'info',
            title: 'New Feedback Received',
            message: 'Mike QA submitted feedback for Banking Dashboard',
            timestamp: '2024-02-05T09:15:00Z',
            read: false,
            actionUrl: '/developer/feedback',
            icon: FiFileText
        },
        {
            id: 'dev-3',
            type: 'warning',
            title: 'Task Deadline Approaching',
            message: 'Social Media Platform testing deadline is in 2 days',
            timestamp: '2024-02-04T16:45:00Z',
            read: false,
            actionUrl: '/developer/tasks',
            icon: FiClock
        },
        {
            id: 'dev-4',
            type: 'success',
            title: 'Payment Processed',
            message: '₹500 credited to your account for completed task',
            timestamp: '2024-02-04T14:20:00Z',
            read: false,
            actionUrl: '/developer/payments',
            icon: FiDollarSign
        },
        {
            id: 'dev-5',
            type: 'info',
            title: 'New Tester Applied',
            message: 'Lisa QA applied for your Healthcare Portal testing task',
            timestamp: '2024-02-03T11:10:00Z',
            read: false,
            actionUrl: '/developer/tasks',
            icon: FiUser
        }
    ],
    tester: [
        {
            id: 'test-1',
            type: 'success',
            title: 'Task Assigned',
            message: 'You have been assigned to test Real Estate Platform',
            timestamp: '2024-02-05T11:00:00Z',
            read: false,
            actionUrl: '/tester/my-tasks',
            icon: FiCheckCircle
        },
        {
            id: 'test-2',
            type: 'info',
            title: 'New Task Available',
            message: 'Healthcare Portal testing task is now available (450 credits)',
            timestamp: '2024-02-05T08:30:00Z',
            read: false,
            actionUrl: '/tester/marketplace',
            icon: FiFileText
        },
        {
            id: 'test-3',
            type: 'warning',
            title: 'Feedback Revision Needed',
            message: 'Your feedback for E-Commerce App needs revision',
            timestamp: '2024-02-04T15:20:00Z',
            read: false,
            actionUrl: '/tester/my-tasks',
            icon: FiAlertCircle
        },
        {
            id: 'test-4',
            type: 'success',
            title: 'Payment Received',
            message: '220 credits added to your wallet for Banking Dashboard testing',
            timestamp: '2024-02-04T13:45:00Z',
            read: false,
            actionUrl: '/tester/wallet',
            icon: FiDollarSign
        },
        {
            id: 'test-5',
            type: 'warning',
            title: 'Task Deadline Approaching',
            message: 'Travel Booking App testing deadline is tomorrow',
            timestamp: '2024-02-03T10:15:00Z',
            read: false,
            actionUrl: '/tester/my-tasks',
            icon: FiClock
        }
    ],
    admin: [
        {
            id: 'admin-1',
            type: 'info',
            title: 'New User Registration',
            message: 'David Test registered as a tester and needs verification',
            timestamp: '2024-02-05T12:00:00Z',
            read: false,
            actionUrl: '/admin/verification',
            icon: FiUser
        },
        {
            id: 'admin-2',
            type: 'warning',
            title: 'Task Verification Needed',
            message: 'Banking Dashboard testing results need admin verification',
            timestamp: '2024-02-05T09:45:00Z',
            read: false,
            actionUrl: '/admin/verification',
            icon: FiFileText
        },
        {
            id: 'admin-3',
            type: 'alert',
            title: 'Dispute Reported',
            message: 'Dispute raised for E-Commerce App testing payment',
            timestamp: '2024-02-04T17:30:00Z',
            read: false,
            actionUrl: '/admin/tasks',
            icon: FiAlertCircle
        },
        {
            id: 'admin-4',
            type: 'success',
            title: 'Platform Revenue Update',
            message: 'Monthly revenue target achieved - ₹18,750 earned',
            timestamp: '2024-02-04T14:00:00Z',
            read: false,
            actionUrl: '/admin/analytics',
            icon: FiDollarSign
        },
        {
            id: 'admin-5',
            type: 'info',
            title: 'User Suspension Alert',
            message: 'Maria Garcia account suspended due to policy violation',
            timestamp: '2024-02-03T16:20:00Z',
            read: false,
            actionUrl: '/admin/users',
            icon: FiUser
        }
    ]
};

function Notification() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user?.role && mockNotifications[user.role]) {
            setNotifications(mockNotifications[user.role]);
        }
    }, [user]);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications([]);
    };

    const deleteNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return <FiCheckCircle size={16} />;
            case 'warning': return <FiAlertCircle size={16} />;
            case 'alert': return <FiAlertCircle size={16} />;
            default: return <FiInfo size={16} />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success': return 'success';
            case 'warning': return 'warning';
            case 'alert': return 'danger';
            default: return 'info';
        }
    };

    return (
        <div className="notification-wrapper">
            <Button
                variant="ghost"
                className="notification-trigger"
                onClick={() => setIsOpen(!isOpen)}
                icon={<FiBell size={20} />}
            >
                {unreadCount > 0 && (
                    <Badge variant="danger" size="sm" className="notification-badge">
                        {unreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <div className="notification-dropdown" ref={dropdownRef}>
                    <div className="notification-header">
                        <h3 className="notification-title">Notifications</h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                            >
                                Mark all read
                            </Button>
                        )}
                    </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="notification-empty">
                                    <FiBell size={48} />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="notification-icon">
                                            <notification.icon size={20} />
                                        </div>

                                        <div className="notification-content">
                                            <div className="notification-meta">
                                                <h4 className="notification-title-text">
                                                    {notification.title}
                                                </h4>
                                                <Badge
                                                    variant={getNotificationColor(notification.type)}
                                                    size="sm"
                                                >
                                                    {notification.type}
                                                </Badge>
                                            </div>
                                            <p className="notification-message">
                                                {notification.message}
                                            </p>
                                            <span className="notification-time">
                                                {formatRelativeTime(notification.timestamp)}
                                            </span>
                                        </div>

                                        <button
                                            className="notification-delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            aria-label="Delete notification"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="notification-footer">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    fullWidth
                                    onClick={() => setIsOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        )}
                    </div>
            )}
        </div>
    );
}

export default Notification;           