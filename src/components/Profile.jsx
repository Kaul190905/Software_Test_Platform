import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCurrency } from '../utils/helpers';
import Button from './common/Button';
import Badge from './common/Badge';
import {
    FiUser,
    FiMail,
    FiBriefcase,
    FiStar,
    FiCheckCircle,
    FiDollarSign,
    FiCalendar,
    FiEdit2,
    FiSave,
    FiX,
    FiCamera,
    FiShield,
    FiTrendingUp
} from 'react-icons/fi';
import './Profile.css';

function Profile() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        bio: '',
        phone: '',
        location: '',
        website: '',
        skills: []
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                company: user.company || '',
                bio: user.bio || '',
                phone: user.phone || '',
                location: user.location || '',
                website: user.website || '',
                skills: user.skills || []
            });
        }
    }, [user]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        const updatedUser = {
            ...user,
            ...formData
        };
        updateUser(updatedUser);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            company: user.company || '',
            bio: user.bio || '',
            phone: user.phone || '',
            location: user.location || '',
            website: user.website || '',
            skills: user.skills || []
        });
        setIsEditing(false);
    };

    const getRoleBadge = (role) => {
        const roleConfig = {
            developer: { label: 'Developer', variant: 'primary' },
            tester: { label: 'Tester', variant: 'success' },
            admin: { label: 'Administrator', variant: 'warning' }
        };
        return roleConfig[role] || { label: role, variant: 'secondary' };
    };

    const renderBasicInfo = () => (
        <div className="profile-section">
            <div className="section-header">
                <h3 className="section-title">
                    <FiUser size={20} />
                    Basic Information
                </h3>
                {!isEditing && (
                    <Button
                        variant="outline"
                        size="sm"
                        icon={<FiEdit2 />}
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </Button>
                )}
            </div>

            <div className="profile-avatar-section">
                <div className="avatar-container">
                    <div className="avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                        )}
                    </div>
                    {isEditing && (
                        <button className="avatar-edit-btn">
                            <FiCamera size={16} />
                        </button>
                    )}
                </div>
                <div className="avatar-info">
                    <h2 className="user-name">{user?.name}</h2>
                    <Badge variant={getRoleBadge(user?.role).variant}>
                        {getRoleBadge(user?.role).label}
                    </Badge>
                    <p className="user-email">{user?.email}</p>
                </div>
            </div>

            <div className="profile-fields">
                <div className="field-group">
                    <label className="field-label">
                        <FiUser size={16} />
                        Full Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            className="field-input"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                    ) : (
                        <p className="field-value">{user?.name || 'Not provided'}</p>
                    )}
                </div>

                <div className="field-group">
                    <label className="field-label">
                        <FiMail size={16} />
                        Email
                    </label>
                    {isEditing ? (
                        <input
                            type="email"
                            className="field-input"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                    ) : (
                        <p className="field-value">{user?.email}</p>
                    )}
                </div>

                {user?.role === 'developer' && (
                    <div className="field-group">
                        <label className="field-label">
                            <FiBriefcase size={16} />
                            Company
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="field-input"
                                value={formData.company}
                                onChange={(e) => handleInputChange('company', e.target.value)}
                                placeholder="Enter your company name"
                            />
                        ) : (
                            <p className="field-value">{user?.company || 'Not provided'}</p>
                        )}
                    </div>
                )}

                <div className="field-group">
                    <label className="field-label">
                        <FiCalendar size={16} />
                        Member Since
                    </label>
                    <p className="field-value">{formatDate(user?.joinedDate, { year: 'numeric', month: 'long' })}</p>
                </div>
            </div>

            {isEditing && (
                <div className="profile-actions">
                    <Button
                        variant="outline"
                        size="sm"
                        icon={<FiX />}
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        icon={<FiSave />}
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );

    const renderRoleSpecificInfo = () => {
        if (user?.role === 'tester') {
            return (
                <div className="profile-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <FiCheckCircle size={20} />
                            Tester Statistics
                        </h3>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon success">
                                <FiCheckCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{user?.completedTests || 0}</div>
                                <div className="stat-label">Completed Tests</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon primary">
                                <FiStar size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{user?.rating || 0}</div>
                                <div className="stat-label">Average Rating</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon secondary">
                                <FiDollarSign size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{formatCurrency(user?.walletBalance || 0)}</div>
                                <div className="stat-label">Wallet Balance</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (user?.role === 'developer') {
            return (
                <div className="profile-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <FiTrendingUp size={20} />
                            Developer Activity
                        </h3>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon primary">
                                <FiCheckCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{user?.activeProjects || 0}</div>
                                <div className="stat-label">Active Projects</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon success">
                                <FiCheckCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{user?.completedProjects || 0}</div>
                                <div className="stat-label">Completed Projects</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon secondary">
                                <FiDollarSign size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{formatCurrency(user?.totalBudgetSpent || 0)}</div>
                                <div className="stat-label">Total Spent</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (user?.role === 'admin') {
            return (
                <div className="profile-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <FiShield size={20} />
                            Administrator Access
                        </h3>
                    </div>

                    <div className="admin-info">
                        <div className="permission-badge">
                            <FiShield size={16} />
                            <span>Full System Access</span>
                        </div>
                        <p className="admin-description">
                            As an administrator, you have full access to manage users, tasks, and platform settings.
                        </p>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (!user) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title">My Profile</h1>
                <p className="profile-subtitle">Manage your account information and preferences</p>
            </div>

            <div className="profile-content">
                {renderBasicInfo()}
                {renderRoleSpecificInfo()}
            </div>
        </div>
    );
}

export default Profile;