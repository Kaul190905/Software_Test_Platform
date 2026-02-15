import { useState } from 'react';
import { adminTasks } from '../../data/mockData';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/helpers';
import { FiSearch, FiFilter, FiMoreVertical, FiExternalLink } from 'react-icons/fi';
import './AdminTasks.css';

function AdminTasks() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredTasks = adminTasks.filter(task => {
        const matchesSearch = task.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.developerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const statusMap = {
            'open': { label: 'Open', variant: 'info' },
            'in-progress': { label: 'In Progress', variant: 'primary' },
            'pending-review': { label: 'Pending Review', variant: 'warning' },
            'under-verification': { label: 'Verification', variant: 'secondary' },
            'completed': { label: 'Completed', variant: 'success' },
        };
        const config = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="admin-tasks-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Global Task Management</h1>
                    <p className="page-subtitle">Oversight of all testing activities across the platform.</p>
                </div>
            </div>

            <div className="card admin-tasks-card">
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by app or developer..."
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
                            <option value="under-verification">Under Verification</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="admin-tasks-table">
                        <thead>
                            <tr>
                                <th>Task Detail</th>
                                <th>Developer</th>
                                <th>Budget</th>
                                <th>Testers</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map(task => (
                                <tr key={task.id}>
                                    <td>
                                        <div className="task-detail-cell">
                                            <span className="task-name">{task.appName}</span>
                                            <span className="task-type">{task.testTypes?.join(', ')}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="dev-cell">
                                            <span className="dev-name">{task.developerName || 'System'}</span>
                                            <span className="dev-company">{task.developerCompany || 'Internal'}</span>
                                        </div>
                                    </td>
                                    <td>{formatCurrency(task.budget)}</td>
                                    <td>{task.testersAssigned}</td>
                                    <td>{getStatusBadge(task.status)}</td>
                                    <td>{task.createdAt}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="icon-btn"><FiExternalLink /></button>
                                            <button className="icon-btn"><FiMoreVertical /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminTasks;
