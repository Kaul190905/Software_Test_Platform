import { useState } from 'react';
import { developerFeedback } from '../../data/mockData';
import Badge, { AIBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { FiCheckCircle, FiXCircle, FiInfo, FiEye } from 'react-icons/fi';
import './Verification.css';

function Verification() {
    // In a real app, this would be a filtered list of pending or flagged submissions
    const pendingVerifications = developerFeedback.filter(fb => fb.status === 'pending');

    return (
        <div className="verification-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manual Verification Queue</h1>
                    <p className="page-subtitle">Review flagged submissions and high-value testing reports.</p>
                </div>
            </div>

            <div className="verification-list">
                {pendingVerifications.map(item => (
                    <div key={item.id} className="card verification-card">
                        <div className="verification-card-header">
                            <div className="tester-profile">
                                <div className="avatar sm">{item.testerName.split(' ').map(n => n[0]).join('')}</div>
                                <div>
                                    <h4 className="tester-name">{item.testerName}</h4>
                                    <p className="task-ref">Task: {item.taskName}</p>
                                </div>
                            </div>
                            <div className="verification-status">
                                <AIBadge status={item.aiVerification} />
                                <Badge variant="warning">PENDING MANUAL</Badge>
                            </div>
                        </div>

                        <div className="verification-content">
                            <div className="content-section">
                                <span className="section-label">Observations</span>
                                <p className="section-text">{item.observations}</p>
                            </div>
                            <div className="content-section">
                                <span className="section-label">Proof Attached</span>
                                <div className="proof-preview">
                                    <FiEye /> {item.proofType === 'video' ? 'Screen Recording (2:45)' : '5 Screenshots (ZIP)'}
                                </div>
                            </div>
                        </div>

                        <div className="verification-footer">
                            <div className="admin-actions">
                                <Button variant="secondary" icon={<FiInfo />}>Request Revision</Button>
                                <Button variant="danger" icon={<FiXCircle />}>Reject</Button>
                                <Button variant="success" icon={<FiCheckCircle />}>Approve & Release Credits</Button>
                            </div>
                        </div>
                    </div>
                ))}

                {pendingVerifications.length === 0 && (
                    <div className="empty-state">
                        <FiCheckCircle size={48} />
                        <h3>Queue is clear!</h3>
                        <p>No submissions currently require manual verification.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Verification;
