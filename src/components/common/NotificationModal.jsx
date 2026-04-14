import { FiX, FiBell, FiCheck } from 'react-icons/fi';
import { formatRelativeTime } from '../../utils/helpers';
import './NotificationModal.css';

function NotificationModal({ isOpen, onClose, notifications, onMarkAllAsRead }) {
    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="notification-modal" onClick={e => e.stopPropagation()}>
                <div className="notification-modal-header">
                    <div className="notification-modal-title">
                        <FiBell className="notification-modal-icon" />
                        <h2>Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="notification-badge-large">{unreadCount} New</span>
                        )}
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close notifications">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="notification-modal-body">
                    {notifications.length === 0 ? (
                        <div className="notification-empty">
                            <FiCheck size={48} className="notification-empty-icon" />
                            <p>You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-card ${notification.unread ? 'unread' : ''}`}
                                >
                                    <div className="notification-card-dot" />
                                    <div className="notification-card-content">
                                        <div className="notification-card-header">
                                            <h3>{notification.title}</h3>
                                            <span className="notification-card-time">
                                                {formatRelativeTime(notification.time)}
                                            </span>
                                        </div>
                                        <p>{notification.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="notification-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    {unreadCount > 0 && (
                        <button className="btn btn-primary" onClick={onMarkAllAsRead}>
                            Mark All as Read
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationModal;
