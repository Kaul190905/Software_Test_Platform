import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI } from '../../services/api';
import { getDeadlineStatus, formatCurrency } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { FiPlus, FiSearch, FiFilter, FiMoreVertical, FiEye } from 'react-icons/fi';
import './Tasks.css';

function Tasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');

    useEffect(() => {
        async function fetchTasks() {
            try {
                const res = await tasksAPI.list();
                setTasks(res.tasks || []);
            } catch (err) {
                console.error('Failed to load tasks:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchTasks();
    }, []);

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.appName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' 
            ? true 
            : statusFilter === 'active' 
                ? task.status !== 'completed' 
                : task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const statusMap = {
            'open': { label: 'Open', variant: 'info' },
            'in-progress': { label: 'In Progress', variant: 'primary' },
            'pending-review': { label: 'Pending Review', variant: 'warning' },
            'completed': { label: 'Completed', variant: 'success' },
        };
        const config = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (loading) return <Loader />;

    return (
        <div className="tasks-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Tasks</h1>
                    <p className="page-subtitle">Manage and track your testing requests.</p>
                </div>
                <Button variant="primary" icon={<FiPlus />}>
                    Create New Task
                </Button>
            </div>

            <div className="card tasks-list-card">
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <FiFilter />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="active">Active Tasks</option>
                            <option value="all">All Tasks</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="pending-review">Pending Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Task Name</th>
                                <th>Test Types</th>
                                <th>Budget</th>
                                <th>Testers</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="empty-state">
                                            <FiClipboard size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                            <h3>No Tasks Found</h3>
                                            <p>You haven't created any tasks yet or no tasks match your filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {filteredTasks.map(task => {
                                const deadlineStatus = getDeadlineStatus(task.deadline);
                                return (
                                    <tr key={task._id || task.id}>
                                        <td>
                                            <div className="task-name-cell">
                                                <span className="task-name">{task.appName}</span>
                                                <span className="task-id">#{(task._id || task.id).slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="test-types-tags">
                                                {task.testTypes.slice(0, 2).map((type, i) => (
                                                    <span key={i} className="type-tag">{type}</span>
                                                ))}
                                                {task.testTypes.length > 2 && (
                                                    <span className="type-tag">+{task.testTypes.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{formatCurrency(task.budget)}</td>
                                        <td>{task.testersAssigned || 0}</td>
                                        <td>
                                            <div className="progress-cell">
                                                <div className="progress-mini">
                                                    <div className="progress-bar" style={{ width: `${task.progress}%` }} />
                                                </div>
                                                <span>{task.progress}%</span>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(task.status)}</td>
                                        <td>
                                            <Badge variant={deadlineStatus.color} size="sm">
                                                {deadlineStatus.label}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="icon-btn" title="View Details">
                                                    <FiEye />
                                                </button>
                                                <button className="icon-btn" title="More Options">
                                                    <FiMoreVertical />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Tasks;
