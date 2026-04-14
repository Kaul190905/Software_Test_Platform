import { useState, useEffect } from 'react';
import { tasksAPI, usersAPI, transactionsAPI, analyticsAPI } from '../../services/api';
import { formatCurrency, formatCredits, formatDate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Chart from '../../components/common/Chart';
import Loader from '../../components/common/Loader';
import { FiUsers, FiDollarSign, FiActivity, FiAlertTriangle, FiArrowUpRight, FiTrendingUp, FiTrendingDown, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
    const [timeRange, setTimeRange] = useState('7d');
    const [dashStats, setDashStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [creditLogs, setCreditLogs] = useState([]);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, usersRes, txRes, analyticsRes] = await Promise.all([
                    tasksAPI.getStats(),
                    usersAPI.list(),
                    transactionsAPI.list(),
                    analyticsAPI.overview().catch(() => null),
                ]);
                setDashStats(statsRes);
                setUsers(usersRes.users || []);
                setCreditLogs(txRes.transactions || []);
                setAnalyticsData(analyticsRes);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading || !dashStats) return <Loader />;

    const stats = [
        {
            label: 'Total Users',
            value: dashStats.totalUsers || 0,
            icon: FiUsers,
            iconClass: 'primary',
            change: dashStats.usersChange || 0,
            positive: true,
        },
        {
            label: 'Total Developers',
            value: dashStats.totalDevelopers || 0,
            icon: FiUsers,
            iconClass: 'primary',
        },
        {
            label: 'Platform Revenue',
            value: formatCurrency(dashStats.platformRevenue || 0),
            icon: FiDollarSign,
            iconClass: 'success',
            change: dashStats.revenueChange || 0,
            positive: true,
        },
        {
            label: 'Active Tasks',
            value: dashStats.activeTasks || 0,
            icon: FiActivity,
            iconClass: 'secondary',
        },
        {
            label: 'Disputes Pending',
            value: dashStats.disputesPending || 0,
            icon: FiAlertTriangle,
            iconClass: 'warning',
        },
    ];

    const revenueData = {
        labels: analyticsData?.platformRevenue?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue',
                data: analyticsData?.platformRevenue?.data || [0, 0, 0, 0, 0, 0],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
        ],
    };

    const userGrowthData = {
        labels: analyticsData?.tasksOverTime?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Overall Activity',
                data: analyticsData?.tasksOverTime?.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0],
                borderColor: '#6366f1',
            },
        ],
    };

    const taskDistributionData = {
        labels: analyticsData?.tasksByType?.labels || ['None'],
        datasets: [
            {
                data: analyticsData?.tasksByType?.data || [0],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(20, 184, 166, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
            },
        ],
    };

    const tasksOverTimeData = analyticsData?.tasksOverTime || {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            { label: 'Tasks Created', data: [0, 0, 0, 0, 0, 0], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)' },
            { label: 'Tasks Completed', data: [0, 0, 0, 0, 0, 0], borderColor: '#14b8a6', backgroundColor: 'rgba(20, 184, 166, 0.1)' },
        ],
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            active: { label: 'Active', variant: 'success' },
            inactive: { label: 'Inactive', variant: 'secondary' },
            suspended: { label: 'Suspended', variant: 'danger' },
        };
        const config = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="admin-dashboard">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Platform overview and management</p>
                </div>
                <div className="time-range-selector">
                    {['24h', '7d', '30d', '90d'].map(range => (
                        <button
                            key={range}
                            className={`time-btn ${timeRange === range ? 'active' : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="card stats-card">
                        <div className={`stats-icon ${stat.iconClass}`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stats-value">{stat.value}</div>
                        <div className="stats-label">{stat.label}</div>
                        {stat.change && (
                            <div className={`stats-change ${stat.positive ? 'positive' : 'negative'}`}>
                                {stat.positive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                                <span>{stat.change}% vs last period</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="content-grid">
                <div className="col-8">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Platform Revenue</h3>
                        </div>
                        <Chart type="line" data={revenueData} height={280} />
                    </div>
                </div>
                <div className="col-4">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Task Distribution</h3>
                        </div>
                        <Chart type="doughnut" data={taskDistributionData} height={220} />
                    </div>
                </div>
            </div>

            {/* Users and Activity */}
            <div className="content-grid" style={{ marginTop: 'var(--space-6)' }}>
                {/* Recent Users */}
                <div className="col-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Recent Users</h3>
                            <Link to="/admin/users" className="card-link">
                                View all <FiArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.slice(0, 5).map(user => (
                                        <tr key={user._id || user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="avatar sm">{user.name ? user.name.split(' ').map(n => n[0]).join('') : '?'}</div>
                                                    <div>
                                                        <p className="user-name">{user.name}</p>
                                                        <p className="user-email">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge variant={user.role === 'developer' ? 'primary' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td>{getStatusBadge(user.status)}</td>
                                            <td className="date-cell">{formatDate(user.joinedAt || user.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Credit Activity */}
                <div className="col-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Credit Activity</h3>
                            <Link to="/admin/credits" className="card-link">
                                View all <FiArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div className="credit-activity">
                            {creditLogs.length > 0 ? creditLogs.slice(0, 5).map(log => (
                                <div key={log._id || log.id} className="credit-log-item">
                                    <div className="log-info">
                                        <p className="log-description">{log.description}</p>
                                        <p className="log-user">{log.userName} • {formatDate(log.timestamp)}</p>
                                    </div>
                                    <span className={`log-amount ${log.type}`}>
                                        {log.type === 'credit' ? '+' : '-'}{formatCredits(log.amount)}
                                    </span>
                                </div>
                            )) : (
                                <p style={{ padding: '1rem', opacity: 0.6 }}>No transactions yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tasks & Completion Overview */}
                <div className="col-12" style={{ marginTop: 'var(--space-6)' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Tasks & Completion Overview</h3>
                        </div>
                        <Chart type="line" data={tasksOverTimeData} height={300} />
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="col-12" style={{ marginTop: 'var(--space-6)' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">User Growth</h3>
                        </div>
                        <Chart type="line" data={userGrowthData} height={250} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
