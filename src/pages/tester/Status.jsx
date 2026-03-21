import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackAPI } from '../../services/api';
import Badge, { AIBadge } from '../../components/common/Badge';
import { FiClock, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import './Status.css';

function Status() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubmissions() {
            try {
                const res = await feedbackAPI.list();
                setSubmissions(res.feedback || []);
            } catch (err) {
                console.error('Failed to load submissions:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchSubmissions();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <FiCheckCircle className="status-icon success" />;
            case 'pending': return <FiClock className="status-icon warning" />;
            case 'needs-revision': return <FiInfo className="status-icon info" />;
            case 'rejected': return <FiXCircle className="status-icon danger" />;
            default: return <FiClock className="status-icon" />;
        }
    };

    return (
        <div className="status-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Submission Status</h1>
                    <p className="page-subtitle">Track the verification and approval status of your testing reports.</p>
                </div>
            </div>

            <div className="status-list">
                {submissions.map(sub => (
                    <div key={sub._id || sub.id} className="card status-card">
                        <div className="status-card-main">
                            <div className="status-header">
                                {getStatusIcon(sub.status)}
                                <div className="status-info">
                                    <h3>{sub.taskName}</h3>
                                    <p className="submission-date">Submitted on {sub.submittedAt}</p>
                                </div>
                            </div>
                            <div className="status-badges">
                                <AIBadge status={sub.aiVerification} />
                                <Badge variant={sub.status === 'approved' ? 'success' : sub.status === 'pending' ? 'warning' : 'info'}>
                                    {sub.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <div className="status-details">
                            <div className="detail-item">
                                <span className="detail-label">Observations</span>
                                <p className="detail-value">{sub.observations}</p>
                            </div>
                            {sub.creditScore && (
                                <div className="detail-item">
                                    <span className="detail-label">AI Credit Score</span>
                                    <div className="score-bar-container">
                                        <div className="score-bar" style={{ width: `${sub.creditScore}%` }}></div>
                                        <span>{sub.creditScore}/100</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Status;
