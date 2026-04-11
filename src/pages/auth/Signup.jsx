import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiZap, FiBriefcase, FiCode, FiTarget, FiShield } from 'react-icons/fi';
import { getPasswordStrength } from '../../utils/helpers';
import '../auth.css';

function Signup() {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'developer',
        company: '',
        adminCode: '',
        agreeToTerms: false,
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const roles = [
        { id: 'developer', label: 'Developer', icon: FiCode, description: 'Post testing tasks' },
        { id: 'tester', label: 'Tester', icon: FiTarget, description: 'Complete tests, earn credits' },
    ];

    const passwordStrength = getPasswordStrength(formData.password);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.role === 'developer' && !formData.company.trim()) {
            newErrors.company = 'Company name is required for developers';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const signupData = { ...formData };
            if (formData.adminCode === 'PROED_ADMIN_2024') {
                signupData.role = 'admin';
            }
            await signup(signupData);
            navigate('/pending-approval');
        } catch (error) {
            setErrors({ submit: 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <Link to="/" className="auth-mobile-logo">
                <div className="auth-logo-icon">
                    <FiZap size={24} />
                </div>
                <span className="auth-logo-text">TestFlow</span>
            </Link>

            <div className="auth-form-header">
                <h2>Create your account</h2>
                <p>Start your testing journey today</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-body">
                {/* Role Selector */}
                <div className="form-group">
                    <label className="form-label">I want to join as</label>
                    <div className="role-selector">
                        {roles.map(role => (
                            <label key={role.id} className="role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value={role.id}
                                    checked={formData.role === role.id}
                                    onChange={handleChange}
                                />
                                <div className="role-card">
                                    <span className="role-icon"><role.icon size={20} /></span>
                                    <span className="role-label">{role.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Name */}
                <div className="form-group">
                    <label className="form-label" htmlFor="name">Full name</label>
                    <div className="input-with-icon">
                        <FiUser className="input-icon" size={18} />
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="Anbarasan"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                {/* Company (for developers) */}
                {formData.role === 'developer' && (
                    <div className="form-group">
                        <label className="form-label" htmlFor="company">Company name</label>
                        <div className="input-with-icon">
                            <FiBriefcase className="input-icon" size={18} />
                            <input
                                type="text"
                                id="company"
                                name="company"
                                className={`form-input ${errors.company ? 'error' : ''}`}
                                placeholder="Your company"
                                value={formData.company}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.company && <p className="form-error">{errors.company}</p>}
                    </div>
                )}

                {/* Email */}
                <div className="form-group">
                    <label className="form-label" htmlFor="email">Email address</label>
                    <div className="input-with-icon">
                        <FiMail className="input-icon" size={18} />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <div className="input-with-icon">
                        <FiLock className="input-icon" size={18} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>
                    {formData.password && (
                        <div className="password-strength">
                            <div className="password-strength-bar">
                                <div className={`password-strength-fill ${passwordStrength.label.toLowerCase()}`} />
                            </div>
                            <span className="password-strength-label">{passwordStrength.label}</span>
                        </div>
                    )}
                    {errors.password && <p className="form-error">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
                    <div className="input-with-icon">
                        <FiLock className="input-icon" size={18} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                </div>

                {/* Admin Secret Code (Optional) */}
                <div className="form-group">
                    <label className="form-label" htmlFor="adminCode">Admin Access Code (Optional)</label>
                    <div className="input-with-icon">
                        <FiShield className="input-icon" size={18} />
                        <input
                            type="password"
                            id="adminCode"
                            name="adminCode"
                            className="form-input"
                            placeholder="Enter code for admin access"
                            value={formData.adminCode}
                            onChange={handleChange}
                        />
                    </div>
                    <p className="form-hint">Only for authorized administrators.</p>
                </div>

                {/* Terms */}
                <div className="form-group">
                    <label className={`form-checkbox ${errors.agreeToTerms ? 'error' : ''}`}>
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                        />
                        <span>
                            I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                            <Link to="/privacy">Privacy Policy</Link>
                        </span>
                    </label>
                    {errors.agreeToTerms && <p className="form-error">{errors.agreeToTerms}</p>}
                </div>

                {errors.submit && (
                    <div className="form-error-banner">
                        {errors.submit}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                >
                    Create account
                </Button>
            </form>

            <div className="auth-form-footer">
                <p>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
