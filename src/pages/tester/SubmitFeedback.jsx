import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testerActiveTasks } from '../../data/mockData';
import Button from '../../components/common/Button';
import FileUpload from '../../components/common/FileUpload';
import { useToast } from '../../components/common/Toast';
import { FiArrowLeft, FiSend, FiCheckCircle, FiAlertCircle, FiMinusCircle } from 'react-icons/fi';
import './SubmitFeedback.css';

function SubmitFeedback() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        testResult: 'pass',
        observations: '',
        stepsToReproduce: '',
        proofType: 'screenshot',
        proofFiles: [],
    });
    const [errors, setErrors] = useState({});

    const task = testerActiveTasks.find(t => t.id === parseInt(taskId)) || {
        appName: 'Sample App',
        testTypes: ['UI Testing', 'Functional'],
        credits: 500,
    };

    const testResults = [
        { id: 'pass', label: 'All Tests Passed', icon: FiCheckCircle, color: 'success' },
        { id: 'issues-found', label: 'Issues Found', icon: FiAlertCircle, color: 'warning' },
        { id: 'fail', label: 'Critical Failures', icon: FiMinusCircle, color: 'danger' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFilesChange = (files) => {
        setFormData(prev => ({ ...prev, proofFiles: files }));
        if (errors.proofFiles) {
            setErrors(prev => ({ ...prev, proofFiles: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.observations.trim()) {
            newErrors.observations = 'Observations are required';
        } else if (formData.observations.length < 50) {
            newErrors.observations = 'Please provide more detailed observations (min 50 characters)';
        }

        if (formData.testResult !== 'pass' && !formData.stepsToReproduce.trim()) {
            newErrors.stepsToReproduce = 'Steps to reproduce are required when reporting issues';
        }

        if (formData.proofFiles.length === 0) {
            newErrors.proofFiles = 'Please upload at least one proof file';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast.success('Feedback Submitted!', 'Your submission is now pending AI verification.');
        navigate('/tester/dashboard');
    };

    return (
        <div className="submit-feedback-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FiArrowLeft size={18} />
                    <span>Back to Tasks</span>
                </button>
                <div>
                    <h1 className="page-title">Submit Testing Feedback</h1>
                    <p className="page-subtitle">Task: {task.appName}</p>
                </div>
            </div>

            <div className="submit-container">
                {/* Main Form */}
                <div className="card submit-form-card">
                    <form onSubmit={handleSubmit}>
                        {/* Test Result */}
                        <div className="form-section">
                            <h3 className="section-title">Test Result</h3>
                            <p className="section-description">What was the overall outcome of your testing?</p>

                            <div className="test-result-options">
                                {testResults.map(result => (
                                    <label
                                        key={result.id}
                                        className={`result-option ${formData.testResult === result.id ? 'selected' : ''} ${result.color}`}
                                    >
                                        <input
                                            type="radio"
                                            name="testResult"
                                            value={result.id}
                                            checked={formData.testResult === result.id}
                                            onChange={handleChange}
                                        />
                                        <result.icon size={24} />
                                        <span>{result.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Observations */}
                        <div className="form-section">
                            <h3 className="section-title">Detailed Observations *</h3>
                            <p className="section-description">Describe what you tested, how you tested it, and your findings.</p>

                            <textarea
                                name="observations"
                                className={`form-input form-textarea ${errors.observations ? 'error' : ''}`}
                                placeholder="I tested the login functionality by...&#10;&#10;I noticed that...&#10;&#10;The overall user experience was..."
                                value={formData.observations}
                                onChange={handleChange}
                                rows={6}
                            />
                            <div className="char-count">
                                {formData.observations.length}/50 min characters
                            </div>
                            {errors.observations && <p className="form-error">{errors.observations}</p>}
                        </div>

                        {/* Steps to Reproduce (conditional) */}
                        {formData.testResult !== 'pass' && (
                            <div className="form-section">
                                <h3 className="section-title">Steps to Reproduce *</h3>
                                <p className="section-description">For issues found, provide detailed steps to reproduce.</p>

                                <textarea
                                    name="stepsToReproduce"
                                    className={`form-input form-textarea ${errors.stepsToReproduce ? 'error' : ''}`}
                                    placeholder="1. Navigate to the login page&#10;2. Enter invalid credentials&#10;3. Click 'Submit'&#10;4. Bug: Error message not displayed"
                                    value={formData.stepsToReproduce}
                                    onChange={handleChange}
                                    rows={5}
                                />
                                {errors.stepsToReproduce && <p className="form-error">{errors.stepsToReproduce}</p>}
                            </div>
                        )}

                        {/* Proof Upload */}
                        <div className="form-section">
                            <h3 className="section-title">Proof of Testing *</h3>
                            <p className="section-description">Upload screenshots or video recordings of your testing session.</p>

                            <div className="proof-type-selector">
                                <label className={`proof-type-option ${formData.proofType === 'screenshot' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="proofType"
                                        value="screenshot"
                                        checked={formData.proofType === 'screenshot'}
                                        onChange={handleChange}
                                    />
                                    <span>📷 Screenshots</span>
                                </label>
                                <label className={`proof-type-option ${formData.proofType === 'video' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="proofType"
                                        value="video"
                                        checked={formData.proofType === 'video'}
                                        onChange={handleChange}
                                    />
                                    <span>🎥 Video Recording</span>
                                </label>
                            </div>

                            <FileUpload
                                onFilesChange={handleFilesChange}
                                accept={formData.proofType === 'video' ? 'video/*' : 'image/*'}
                                maxSize={formData.proofType === 'video' ? 100 : 10}
                                multiple={formData.proofType === 'screenshot'}
                                label={formData.proofType === 'video'
                                    ? 'Drag & drop your video or click to upload'
                                    : 'Drag & drop screenshots or click to upload'}
                            />
                            {errors.proofFiles && <p className="form-error">{errors.proofFiles}</p>}
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                icon={<FiSend />}
                                loading={isSubmitting}
                            >
                                Submit Feedback
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Info */}
                <div className="submit-sidebar">
                    <div className="card info-card">
                        <h4>Task Details</h4>
                        <div className="info-item">
                            <span className="info-label">App Name</span>
                            <span className="info-value">{task.appName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Test Types</span>
                            <span className="info-value">{task.testTypes?.join(', ')}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Reward</span>
                            <span className="info-value reward">{task.credits} Credits</span>
                        </div>
                    </div>

                    <div className="card tips-card">
                        <h4>💡 Tips for Approval</h4>
                        <ul>
                            <li>Provide detailed observations with specific examples</li>
                            <li>Include clear screenshots showing the tested areas</li>
                            <li>For video: record your entire testing session</li>
                            <li>Describe both positive findings and issues</li>
                            <li>Use numbered steps when describing bugs</li>
                        </ul>
                    </div>

                    <div className="card ai-info-card">
                        <h4>🤖 AI Verification</h4>
                        <p>Your submission will be automatically analyzed by our AI to verify proof quality and assign credit scores.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubmitFeedback;
