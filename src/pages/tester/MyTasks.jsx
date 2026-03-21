import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { FiSearch, FiFilter, FiArrowRight, FiClock, FiCheckCircle } from 'react-icons/fi';
import './MyTasks.css';

function MyTasks() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('active');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTasks() {
            try {
                const res = await tasksAPI.myTasks();
                setTasks(res.tasks || []);
            } catch (err) {
                console.error('Failed to load tasks:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchTasks();
    }, []);

    const getStatusBadge = (status) => {
        const statusMap = {
            'in-progress': { label: 'In Progress', variant: 'primary' },
            'under-verification': { label: 'Under Verification', variant: 'warning' },
            'completed': { label: 'Completed', variant: 'success' },
            'rejected': { label: 'Rejected', variant: 'danger' },
        };
        const config = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="my-tasks-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Tasks</h1>
                    <p className="page-subtitle">Manage your active tests and track submissions.</p>
                </div>
                <div className="tab-switcher">
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Tasks
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed
                    </button>
                </div>
            </div>

            <div className="tasks-grid">
                {tasks.map(task => (
                    <div key={task._id || task.id} className="card task-card">
                        <div className="task-card-header">
                            <div className="company-info">
                                <div className="company-logo">
                                    {(task.company || task.developerCompany || 'Company').split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="company-name">{task.company || task.developerCompany || ''}</span>
                            </div>
                            {getStatusBadge(task.status)}
                        </div>

                        <h3 className="app-name">{task.appName}</h3>

                        <div className="task-meta-grid">
                            <div className="meta-item">
                                <FiClock size={14} />
                                <span>Deadline: {task.deadline}</span>
                            </div>
                            <div className="meta-item">
                                <FiCheckCircle size={14} />
                                <span>Credits: {task.credits || task.budget || 0}</span>
                            </div>
                        </div>

                        <div className="task-progress-section">
                            <div className="progress-info">
                                <span>Overall Progress</span>
                                <span>{task.progress}%</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${task.progress}%` }} />
                            </div>
                        </div>

                        <div className="task-card-footer">
                            <Link to={`/tester/submit/${task._id || task.taskId || task.id}`}>
                                <Button variant="primary" fullWidth icon={<FiArrowRight />} iconPosition="right">
                                    {task.status === 'in-progress' ? 'Continue Testing' : 'View Submission'}
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyTasks;
