import { adminStats, analyticsData } from '../../data/mockData';
import Chart from '../../components/common/Chart';
import { FiUsers, FiActivity, FiDollarSign, FiZap } from 'react-icons/fi';
import './Analytics.css';

function Analytics() {
    return (
        <div className="analytics-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Platform Analytics</h1>
                    <p className="page-subtitle">Real-time data and growth metrics for the platform.</p>
                </div>
            </div>

            <div className="analytics-stats-grid">
                <div className="card analytics-stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total Users</span>
                        <h2 className="stat-value">{adminStats.totalUsers}</h2>
                        <span className="stat-trend positive">+{adminStats.usersChange}% growth</span>
                    </div>
                    <FiUsers className="stat-icon" />
                </div>

                <div className="card analytics-stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Active Tasks</span>
                        <h2 className="stat-value">{adminStats.activeTasks}</h2>
                        <span className="stat-trend">89 ongoing sessions</span>
                    </div>
                    <FiActivity className="stat-icon" />
                </div>

                <div className="card analytics-stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total Revenue</span>
                        <h2 className="stat-value">${adminStats.platformRevenue}</h2>
                        <span className="stat-trend positive">+{adminStats.revenueChange}% growth</span>
                    </div>
                    <FiDollarSign className="stat-icon" />
                </div>

                <div className="card analytics-stat-card">
                    <div className="stat-info">
                        <span className="stat-label">AI Verifications</span>
                        <h2 className="stat-value">98.5%</h2>
                        <span className="stat-trend">Average accuracy</span>
                    </div>
                    <FiZap className="stat-icon" />
                </div>
            </div>

            <div className="charts-grid">
                <div className="card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Tasks & Completion Overview</h3>
                    </div>
                    <div className="chart-wrapper">
                        <Chart type="line" data={analyticsData.tasksOverTime} height={300} />
                    </div>
                </div>

                <div className="card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Revenue Growth</h3>
                    </div>
                    <div className="chart-wrapper">
                        <Chart type="bar" data={{
                            labels: analyticsData.platformRevenue.labels,
                            datasets: [{
                                label: 'Monthly Revenue',
                                data: analyticsData.platformRevenue.data,
                                backgroundColor: '#6366f1'
                            }]
                        }} height={300} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
