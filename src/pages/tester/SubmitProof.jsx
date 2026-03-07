import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { availableTasks } from '../../data/mockData';
import Button from '../../components/common/Button';
import { FiUpload, FiCheckCircle, FiInfo, FiVideo, FiImage } from 'react-icons/fi';
import './SubmitProof.css';

function SubmitProof() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        observations: '',
        proofType: 'screenshots',
        issuesFound: 'none'
    });

    const task = availableTasks.find(t => t.id === taskId) || availableTasks[0];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        navigate('/tester/status');
    };

    return (
        <div className="submit-proof-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Submit Testing Proof</h1>
                    <p className="page-subtitle">Provide details and evidence of your testing for {task.appName}.</p>
                </div>
            </div>

            <div className="card submission-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Proof Type</label>
                        <div className="proof-type-selector">
                            <label className={`type-option ${formData.proofType === 'screenshots' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="proofType"
                                    value="screenshots"
                                    checked={formData.proofType === 'screenshots'}
                                    onChange={(e) => setFormData({ ...formData, proofType: e.target.value })}
                                />
                                <FiImage />
                                <span>Screenshots (ZIP)</span>
                            </label>
                            <label className={`type-option ${formData.proofType === 'video' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="proofType"
                                    value="video"
                                    checked={formData.proofType === 'video'}
                                    onChange={(e) => setFormData({ ...formData, proofType: e.target.value })}
                                />
                                <FiVideo />
                                <span>Screen Recording</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Evidence</label>
                        <div className="upload-zone">
                            <FiUpload size={32} />
                            <p>Click or drag files to upload proof (Max 50MB)</p>
                            <span className="upload-hint">Supported formats: .zip, .mp4, .mov</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Key Observations</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Describe what you found during testing. Be specific about steps taken..."
                            rows="6"
                            value={formData.observations}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Test Result</label>
                        <select
                            className="form-select"
                            value={formData.issuesFound}
                            onChange={(e) => setFormData({ ...formData, issuesFound: e.target.value })}
                        >
                            <option value="none">No Issues Found (Pass)</option>
                            <option value="minor">Minor UI/UX Issues Found</option>
                            <option value="major">Major Functionality Bugs Found</option>
                            <option value="critical">Critical Security/Crash Vulnerabilities Found</option>
                        </select>
                    </div>

                    <div className="submission-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isLoading}
                            icon={<FiCheckCircle />}
                        >
                            Submit Proof
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SubmitProof;
