import { useState } from 'react';
import { developerFeedback } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge, { AIBadge } from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { FiCheck, FiMessageCircle, FiImage, FiVideo, FiStar, FiFilter } from 'react-icons/fi';
import './FeedbackReview.css';

function FeedbackReview() {
    const toast = useToast();
    const [feedbacks, setFeedbacks] = useState(developerFeedback);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [clarificationNote, setClarificationNote] = useState('');

    const filteredFeedbacks = filter === 'all'
        ? feedbacks
        : feedbacks.filter(f => f.status === filter);

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'Pending Review', variant: 'warning' },
            'approved': { label: 'Approved', variant: 'success' },
            'needs-revision': { label: 'Needs Revision', variant: 'danger' },
        };
        const config = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleApprove = (id) => {
        setFeedbacks(prev => prev.map(f =>
            f.id === id ? { ...f, status: 'approved' } : f
        ));
        toast.success('Feedback Approved', 'Credits have been released to the tester.');
        setShowModal(false);
    };

    const handleRequestClarification = (id) => {
        if (!clarificationNote.trim()) {
            toast.error('Note Required', 'Please provide a clarification note.');
            return;
        }
        setFeedbacks(prev => prev.map(f =>
            f.id === id ? { ...f, status: 'needs-revision' } : f
        ));
        toast.warning('Clarification Requested', 'The tester has been notified.');
        setShowModal(false);
        setClarificationNote('');
    };

    const openReviewModal = (feedback) => {
        setSelectedFeedback(feedback);
        setShowModal(true);
    };

    return (
        <div className="feedback-review-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Feedback Review</h1>
                    <p className="page-subtitle">Review and manage tester submissions</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({feedbacks.length})
                </button>
                <button
                    className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({feedbacks.filter(f => f.status === 'pending').length})
                </button>
                <button
                    className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    Approved ({feedbacks.filter(f => f.status === 'approved').length})
                </button>
                <button
                    className={`filter-tab ${filter === 'needs-revision' ? 'active' : ''}`}
                    onClick={() => setFilter('needs-revision')}
                >
                    Needs Revision ({feedbacks.filter(f => f.status === 'needs-revision').length})
                </button>
            </div>

            {/* Feedback List */}
            <div className="feedback-list">
                {filteredFeedbacks.map(feedback => (
                    <div key={feedback.id} className="card feedback-item">
                        <div className="feedback-item-header">
                            <div className="tester-info">
                                <div className="avatar">{feedback.testerName.split(' ').map(n => n[0]).join('')}</div>
                                <div>
                                    <h4 className="tester-name">{feedback.testerName}</h4>
                                    <div className="tester-rating">
                                        <FiStar size={12} />
                                        <span>{feedback.testerRating}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="feedback-badges">
                                <AIBadge status={feedback.aiVerification} />
                                {getStatusBadge(feedback.status)}
                            </div>
                        </div>

                        <div className="feedback-item-body">
                            <div className="feedback-meta">
                                <span className="task-name">{feedback.taskName}</span>
                                <span className="submit-date">{formatDate(feedback.submittedAt)}</span>
                            </div>

                            <p className="feedback-observations">{feedback.observations}</p>

                            <div className="proof-preview">
                                <div className="proof-type">
                                    {feedback.proofType === 'video' ? <FiVideo size={16} /> : <FiImage size={16} />}
                                    <span>{feedback.proofType === 'video' ? 'Video Recording' : 'Screenshots'}</span>
                                </div>
                                <div className="credit-score">
                                    <span className="score-label">AI Credit Score</span>
                                    <span className="score-value">{feedback.creditScore}/100</span>
                                </div>
                            </div>
                        </div>

                        <div className="feedback-item-footer">
                            <Badge
                                variant={
                                    feedback.testResult === 'pass' ? 'success' :
                                        feedback.testResult === 'fail' ? 'danger' : 'warning'
                                }
                            >
                                {feedback.testResult === 'issues-found' ? 'Issues Found' : feedback.testResult}
                            </Badge>

                            {feedback.status === 'pending' && (
                                <Button variant="primary" size="sm" onClick={() => openReviewModal(feedback)}>
                                    Review
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Review Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Review Submission"
                size="lg"
            >
                {selectedFeedback && (
                    <div className="review-modal-content">
                        <div className="review-header">
                            <div className="tester-info">
                                <div className="avatar lg">{selectedFeedback.testerName.split(' ').map(n => n[0]).join('')}</div>
                                <div>
                                    <h3>{selectedFeedback.testerName}</h3>
                                    <p className="tester-rating">
                                        <FiStar size={14} /> {selectedFeedback.testerRating} rating
                                    </p>
                                </div>
                            </div>
                            <AIBadge status={selectedFeedback.aiVerification} />
                        </div>

                        <div className="review-section">
                            <h4>Task</h4>
                            <p>{selectedFeedback.taskName}</p>
                        </div>

                        <div className="review-section">
                            <h4>Observations</h4>
                            <p>{selectedFeedback.observations}</p>
                        </div>

                        <div className="review-section">
                            <h4>Proof</h4>
                            <div className="proof-placeholder">
                                {selectedFeedback.proofType === 'video' ? (
                                    <div className="video-placeholder">
                                        <FiVideo size={40} />
                                        <p>Video Recording</p>
                                        <Button variant="secondary" size="sm">Play Video</Button>
                                    </div>
                                ) : (
                                    <div className="screenshot-placeholder">
                                        <FiImage size={40} />
                                        <p>3 Screenshots attached</p>
                                        <Button variant="secondary" size="sm">View All</Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="review-section">
                            <h4>AI Analysis</h4>
                            <div className="ai-analysis">
                                <div className="analysis-item">
                                    <span>Verification Status</span>
                                    <AIBadge status={selectedFeedback.aiVerification} />
                                </div>
                                <div className="analysis-item">
                                    <span>Credit Score</span>
                                    <strong>{selectedFeedback.creditScore}/100</strong>
                                </div>
                            </div>
                        </div>

                        <div className="review-section">
                            <h4>Request Clarification Note (Optional)</h4>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Explain what needs to be clarified or fixed..."
                                value={clarificationNote}
                                onChange={(e) => setClarificationNote(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="review-actions">
                            <Button
                                variant="danger"
                                icon={<FiMessageCircle />}
                                onClick={() => handleRequestClarification(selectedFeedback.id)}
                            >
                                Request Clarification
                            </Button>
                            <Button
                                variant="success"
                                icon={<FiCheck />}
                                onClick={() => handleApprove(selectedFeedback.id)}
                            >
                                Approve & Release Credits
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default FeedbackReview;
