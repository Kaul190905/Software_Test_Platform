import { useParams, useNavigate } from 'react-router-dom';
import { availableTasks } from '../../data/mockData';
import { formatCredits, formatDate, getDeadlineStatus } from '../../utils/helpers';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import Badge from '../../components/common/Badge';
import { FiCalendar, FiClock, FiCheckCircle, FiInfo, FiArrowLeft } from 'react-icons/fi';
import './TaskDetails.css';

function TaskDetails() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    
    // Find the task from mock data
    const task = availableTasks.find(t => t.id === taskId);

    if (!task) {
        return (
            <div className="task-details-page">
                <div className="error-container">
                    <h2>Task Not Found</h2>
                    <p>The task you are looking for might have been removed or is no longer available.</p>
                    <Button variant="primary" onClick={() => navigate('/tester/marketplace')}>
                        Back to Marketplace
                    </Button>
                </div>
            </div>
        );
    }

    const deadline = getDeadlineStatus(task.deadline);
    const toast = useToast();

    const handleAcceptTask = () => {
        // In a real app, this would call an API
        // For now, we'll just simulate success and navigate
        toast.success(
            'Task Accepted!', 
            `You have successfully accepted "${task.appName}". Good luck!`
        );
        setTimeout(() => {
            navigate('/tester/my-tasks');
        }, 500);
    };

    return (
        <div className="task-details-page">
            <button className="back-link" onClick={() => navigate(-1)}>
                <FiArrowLeft size={18} />
                Back to Marketplace
            </button>

            <div className="task-details-header">
                <div className="header-main">
                    <Badge variant="primary" size="lg">{task.level}</Badge>
                    <h1 className="task-title">{task.appName}</h1>
                    <p className="company-name">by {task.companyName}</p>
                </div>
                <div className="header-stats">
                    <div className="stat-item">
                        <span className="stat-value">{formatCredits(task.credits)}</span>
                        <span className="stat-label">Credits</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-value">{task.openSlots}</span>
                        <span className="stat-label">Spots Left</span>
                    </div>
                </div>
            </div>

            <div className="task-details-grid">
                <div className="details-main">
                    <section className="details-section">
                        <h2 className="section-title">Description</h2>
                        <p className="description-text">{task.description}</p>
                    </section>

                    <section className="details-section">
                        <h2 className="section-title">What to Test</h2>
                        <div className="test-types-list">
                            {task.testTypes.map(type => (
                                <div key={type} className="test-type-item">
                                    <FiCheckCircle className="check-icon" />
                                    <span>{type} Testing</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="details-section">
                        <h2 className="section-title">Requirements</h2>
                        <ul className="requirements-list">
                            <li>Must have a stable internet connection.</li>
                            <li>Environment: Latest version of Chrome or Safari.</li>
                            <li>Detailed observations for each test case.</li>
                            <li>Clear screenshots or video recording of issues found.</li>
                        </ul>
                    </section>
                </div>

                <div className="details-sidebar">
                    <div className="card info-card">
                        <h3 className="card-title">Task Info</h3>
                        <div className="info-row">
                            <FiCalendar className="info-icon" />
                            <div className="info-content">
                                <span className="info-label">Deadline</span>
                                <span className="info-value">{formatDate(task.deadline)}</span>
                                <Badge variant={deadline.color} size="sm">{deadline.label}</Badge>
                            </div>
                        </div>
                        <div className="info-row">
                            <FiClock className="info-icon" />
                            <div className="info-content">
                                <span className="info-label">Estimated Time</span>
                                <span className="info-value">{task.estimatedTime}</span>
                            </div>
                        </div>
                        <div className="info-row">
                            <FiInfo className="info-icon" />
                            <div className="info-content">
                                <span className="info-label">App URL</span>
                                <a href={task.appUrl} target="_blank" rel="noopener noreferrer" className="app-link">
                                    {task.appUrl}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="acceptance-card">
                        <h3>Ready to start?</h3>
                        <p>By accepting this task, you agree to complete it before the deadline and follow the testing requirements.</p>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            size="lg"
                            onClick={handleAcceptTask}
                        >
                            Accept & Start Testing
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetails;
