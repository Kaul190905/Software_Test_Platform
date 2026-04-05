import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { FiMail, FiZap, FiArrowLeft } from 'react-icons/fi';
import '../auth.css';

function OTPVerification() {
    const navigate = useNavigate();
    const { user, verifyOTP, isAuthenticated } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Get signup data
    const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();

        // Resend timer
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];

        // Handle paste
        if (value.length > 1) {
            const digits = value.slice(0, 6).split('');
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);
            const lastIndex = Math.min(index + digits.length, 5);
            inputRefs.current[lastIndex]?.focus();
            return;
        }

        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        if (!canResend) return;
        setResendTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter the complete OTP');
            return;
        }

        setIsLoading(true);
        try {
            await verifyOTP(otpValue);
            const role = user?.role || signupData.role || 'developer';
            sessionStorage.removeItem('signupData');
            navigate(`/${role}/dashboard`);
        } catch (error) {
            setError('Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <div className="auth-mobile-logo">
                <div className="auth-logo-icon">
                    <FiZap size={24} />
                </div>
                <span className="auth-logo-text">TestFlow</span>
            </div>

            <button
                className="back-button"
                onClick={() => navigate('/signup')}
            >
                <FiArrowLeft size={18} />
                <span>Back to signup</span>
            </button>

            <div className="auth-form-header">
                <div className="otp-icon">
                    <FiMail size={32} />
                </div>
                <h2>Verify your email</h2>
                <p>
                    We've sent a 6-digit code to<br />
                    <strong>{signupData.email || user?.email || 'your email'}</strong>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-body">
                <div className="otp-input-group">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            className={`otp-input ${error ? 'error' : ''}`}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onFocus={(e) => e.target.select()}
                        />
                    ))}
                </div>

                {error && <p className="form-error text-center">{error}</p>}

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                >
                    Verify email
                </Button>

                <div className="resend-section">
                    <p className="resend-text">
                        Didn't receive the code?{' '}
                        {canResend ? (
                            <button
                                type="button"
                                className="resend-button"
                                onClick={handleResend}
                            >
                                Resend code
                            </button>
                        ) : (
                            <span className="resend-timer">Resend in {resendTimer}s</span>
                        )}
                    </p>
                </div>
            </form>

            <div className="otp-hint">
                <p>
                    <strong>Demo:</strong> Enter any 6 digits to verify
                </p>
            </div>
        </div>
    );
}

export default OTPVerification;
