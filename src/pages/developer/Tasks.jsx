import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { developerTasks } from '../../data/mockData';
import { getDeadlineStatus, formatCurrency } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { FiPlus, FiSearch, FiFilter, FiMoreVertical, FiEye } from 'react-icons/fi';
import './Tasks.css';

function Tasks() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredTasks = developerTasks.filter(task => {
        const matchesSearch = task.appName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
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
                            <option value="all">All Status</option>
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
                                <th>testers</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map(task => {
                                const deadlineStatus = getDeadlineStatus(task.deadline);
                                return (
                                    <tr key={task.id}>
                                        <td>
                                            <div className="task-name-cell">
                                                <span className="task-name">{task.appName}</span>
                                                <span className="task-id">#{task.id}</span>
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
                                        <td>{task.testersAssigned}</td>
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
