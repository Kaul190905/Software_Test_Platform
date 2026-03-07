import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OTPVerification from './pages/auth/OTPVerification';

// Developer Pages
import DeveloperDashboard from './pages/developer/DeveloperDashboard';
import CreateTask from './pages/developer/CreateTask';
import Payment from './pages/developer/Payment';
import FeedbackReview from './pages/developer/FeedbackReview';
import Tasks from './pages/developer/Tasks';
import Reports from './pages/developer/Reports';

// Tester Pages
import TesterDashboard from './pages/tester/TesterDashboard';
import Marketplace from './pages/tester/Marketplace';
import SubmitFeedback from './pages/tester/SubmitFeedback';
import MyTasks from './pages/tester/MyTasks';
import Wallet from './pages/tester/Wallet';
import Status from './pages/tester/Status';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminTasks from './pages/admin/AdminTasks';
import Verification from './pages/admin/Verification';
import Analytics from './pages/admin/Analytics';

// Profile Component
import Profile from './components/Profile';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Routes>
                    {/* Public Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/verify-otp" element={<OTPVerification />} />
                    </Route>

                    {/* Developer Routes */}
                    <Route path="/developer" element={<DashboardLayout />}>
                        <Route path="dashboard" element={<DeveloperDashboard />} />
                        <Route path="create-task" element={<CreateTask />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="feedback" element={<FeedbackReview />} />
                        <Route path="payments" element={<Payment />} />
                        <Route path="reports" element={<Reports />} />
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>

                    {/* Tester Routes */}
                    <Route path="/tester" element={<DashboardLayout />}>
                        <Route path="dashboard" element={<TesterDashboard />} />
                        <Route path="marketplace" element={<Marketplace />} />
                        <Route path="my-tasks" element={<MyTasks />} />
                        <Route path="submit-proof" element={<MyTasks />} />
                        <Route path="submit/:taskId" element={<SubmitFeedback />} />
                        <Route path="wallet" element={<Wallet />} />
                        <Route path="status" element={<Status />} />
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route path="/admin" element={<DashboardLayout />}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="tasks" element={<AdminTasks />} />
                        <Route path="verification" element={<Verification />} />
                        <Route path="credits" element={<AdminDashboard />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>

                    {/* Profile Route - accessible to all authenticated users */}
                    <Route path="/profile" element={<DashboardLayout />}>
                        <Route index element={<Profile />} />
                    </Route>

                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
