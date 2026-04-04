import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { pendingUsers } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { FiArrowLeft, FiMail, FiCalendar, FiBriefcase, FiAward, FiCheck, FiX } from 'react-icons/fi';
import './UserRequestDetails.css';

function UserRequestDetails() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const foundUser = pendingUsers.find(u => u.id === userId);
        if (foundUser) {
            setUser(foundUser);
        } else {
            navigate('/admin/requests');
        }
    }, [userId, navigate]);

    const handleAccept = () => {
        setIsProcessing(true);
        // Simulate API call and email sending
        setTimeout(() => {
            toast.success(
                'User Approved', 
                `An enrollment email has been sent to ${user.email}.`
            );
            setIsProcessing(false);
            navigate('/admin/requests');
        }, 1500);
    };

    const handleReject = () => {
        toast.error('Application Rejected', `The request from ${user.name} has been declined.`);
        navigate('/admin/requests');
    };

    if (!user) return null;

    return (
        <div className="user-request-details-page">
            <div className="page-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/admin/requests')}>
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="page-title">Review Application</h1>
                        <p className="page-subtitle">Examine user credentials before granting access</p>
                    </div>
                </div>
            </div>

            <div className="details-container">
                <div className="details-grid">
                    {/* Profile Header Card */}
                    <div className="profile-header-card card">
                        <div className="profile-main-info">
                            <div className="avatar xl">
                                {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="profile-text">
                                <h2 className="profile-name">{user.name}</h2>
                                <Badge variant={user.role === 'developer' ? 'primary' : 'secondary'}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Candidate
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="profile-quick-stats">
                            <div className="quick-stat">
                                <FiMail className="stat-icon" />
                                <div>
                                    <p className="stat-label">Email Address</p>
                                    <p className="stat-value">{user.email}</p>
                                </div>
                            </div>
                            <div className="quick-stat">
                                <FiCalendar className="stat-icon" />
                                <div>
                                    <p className="stat-label">Applied Date</p>
                                    <p className="stat-value">{formatDate(user.joinedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Info Card */}
                    <div className="profile-details-card card">
                        <div className="detail-section">
                            <h3 className="section-title">
                                <FiBriefcase size={18} /> Experience & Background
                            </h3>
                            <div className="detail-content">
                                {user.role === 'developer' ? (
                                    <div className="info-item">
                                        <p className="info-label">Company / Affiliation</p>
                                        <p className="info-value">{user.company || 'Freelance / Individual'}</p>
                                    </div>
                                ) : (
                                    <div className="info-item">
                                        <p className="info-label">Testing Experience</p>
                                        <p className="info-value">{user.experience || 'Entry Level'}</p>
                                    </div>
                                )}
                                <div className="info-item">
                                    <p className="info-label">Biography</p>
                                    <p className="info-value bio-text">{user.bio}</p>
                                </div>
                            </div>
                        </div>

                        {user.skills && user.skills.length > 0 && (
                            <div className="detail-section">
                                <h3 className="section-title">
                                    <FiAward size={18} /> Core Skills
                                </h3>
                                <div className="skills-tags">
                                    {user.skills.map(skill => (
                                        <span key={skill} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="approval-actions">
                            <Button 
                                variant="secondary" 
                                icon={<FiX />} 
                                onClick={handleReject}
                                disabled={isProcessing}
                            >
                                Reject Application
                            </Button>
                            <Button 
                                variant="primary" 
                                icon={<FiCheck />} 
                                onClick={handleAccept}
                                isLoading={isProcessing}
                            >
                                Accept & Send Email
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserRequestDetails;
