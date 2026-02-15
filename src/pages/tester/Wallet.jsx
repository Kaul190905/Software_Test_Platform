import { useAuth } from '../../context/AuthContext';
import { testerStats, creditLogs } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Button from '../../components/common/Button';
import { FiDollarSign, FiTrendingUp, FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';
import './Wallet.css';

function Wallet() {
    const { user } = useAuth();

    return (
        <div className="wallet-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Wallet</h1>
                    <p className="page-subtitle">Track your earnings and manage withdrawals.</p>
                </div>
                <Button variant="primary">
                    Withdraw Credits
                </Button>
            </div>

            <div className="wallet-stats-grid">
                <div className="card wallet-stat-card primary">
                    <div className="stat-icon">
                        <FiDollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Available Balance</span>
                        <h2 className="stat-value">{testerStats.availableCredits} Credits</h2>
                        <span className="stat-subtext">≈ ₹{testerStats.availableCredits * 10}</span>
                    </div>
                </div>

                <div className="card wallet-stat-card">
                    <div className="stat-icon secondary">
                        <FiTrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Earnings</span>
                        <h2 className="stat-value">{testerStats.totalEarnings} Credits</h2>
                        <span className="stat-subtext">+12% from last month</span>
                    </div>
                </div>

                <div className="card wallet-stat-card">
                    <div className="stat-icon warning">
                        <FiArrowUpRight size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Pending Credits</span>
                        <h2 className="stat-value">{testerStats.pendingCredits} Credits</h2>
                        <span className="stat-subtext">Under verification</span>
                    </div>
                </div>
            </div>

            <div className="card transaction-card">
                <div className="card-header">
                    <h3 className="card-title">Transaction History</h3>
                </div>
                <div className="transaction-list">
                    {creditLogs.filter(log => log.userType === 'tester' || log.user === user?.name).map(log => (
                        <div key={log.id} className="transaction-item">
                            <div className="transaction-info">
                                <div className={`type-icon ${log.type}`}>
                                    {log.type === 'credit' ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                                </div>
                                <div>
                                    <p className="transaction-desc">{log.description || log.taskName || 'Withdrawal'}</p>
                                    <p className="transaction-date">{log.timestamp}</p>
                                </div>
                            </div>
                            <div className={`transaction-amount ${log.type}`}>
                                {log.type === 'credit' ? '+' : '-'}{log.amount} Credits
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Wallet;
