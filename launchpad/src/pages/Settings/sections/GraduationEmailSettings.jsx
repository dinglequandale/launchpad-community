import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/AuthContext';
import GraduationEmailService from '../../../services/graduationEmailService';
import toast from 'react-hot-toast';
import { BiEnvelope, BiCalendar, BiRefresh, BiCheckCircle, BiErrorCircle } from 'react-icons/bi';
import './GraduationEmailSettings.css';

const GraduationEmailSettings = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [lastEmailBatch, setLastEmailBatch] = useState(null);
    const [isGraduationTime, setIsGraduationTime] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setIsGraduationTime(GraduationEmailService.isGraduationEmailTime());
        setCurrentYear(GraduationEmailService.getCurrentGraduationYear());
        loadLastEmailBatch();
    }, []);

    const loadLastEmailBatch = async () => {
        // This would load the last email batch from Firestore
        // For now, we'll just set a placeholder
        setLastEmailBatch({
            date: new Date().toLocaleDateString(),
            recipientsCount: 0,
            status: 'completed'
        });
    };

    const handleSendGraduationEmails = async () => {
        if (!currentUser) {
            toast.error('You must be logged in to send emails');
            return;
        }

        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) {
            toast.error('School ID not found');
            return;
        }

        try {
            setLoading(true);
            const result = await GraduationEmailService.sendGraduationEmails(schoolId, false);
            
            if (result.success) {
                toast.success(GraduationEmailService.formatEmailResult(result));
                setLastEmailBatch({
                    date: new Date().toLocaleDateString(),
                    recipientsCount: result.recipientsCount,
                    status: 'completed'
                });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error sending graduation emails:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendTestEmails = async () => {
        if (!currentUser) {
            toast.error('You must be logged in to send test emails');
            return;
        }

        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) {
            toast.error('School ID not found');
            return;
        }

        try {
            setLoading(true);
            const result = await GraduationEmailService.sendGraduationEmails(schoolId, true);
            
            if (result.success) {
                toast.success(`Test emails sent: ${result.message}`);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error sending test emails:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    /* 
    ========================================
    TESTING HELPER - Uncomment to add a quick test button
    ========================================
    
    const handleQuickTest = async () => {
        const testEmail = prompt('Enter test email address:');
        if (!testEmail) return;
        
        try {
            setLoading(true);
            // This would call the testGraduationEmails function if uncommented
            const result = await GraduationEmailService.sendGraduationEmails(
                localStorage.getItem('schoolId'), 
                true // testMode = true
            );
            
            toast.success(`Test email sent to ${testEmail}`);
        } catch (error) {
            toast.error('Test failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    */

    const handleSendMigrationReminders = async () => {
        if (!currentUser) {
            toast.error('You must be logged in to send reminders');
            return;
        }

        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) {
            toast.error('School ID not found');
            return;
        }

        try {
            setLoading(true);
            const result = await GraduationEmailService.sendMigrationReminders(schoolId, 7);
            
            if (result.success) {
                toast.success(GraduationEmailService.formatReminderResult(result));
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error sending migration reminders:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="graduation-email-settings">
            <div className="settings-header">
                <h2>Graduation Email Management</h2>
                <p>Manage graduation emails and alumni migration for the Class of {currentYear}</p>
            </div>

            <div className="email-status-card">
                <div className="status-header">
                    <BiEnvelope className="status-icon" />
                    <h3>Email Status</h3>
                </div>
                <div className="status-content">
                    <div className="status-item">
                        <span className="status-label">Current Time:</span>
                        <span className={`status-value ${isGraduationTime ? 'active' : 'inactive'}`}>
                            {isGraduationTime ? 'June - Graduation Time!' : 'Not Graduation Time'}
                        </span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Last Email Batch:</span>
                        <span className="status-value">
                            {lastEmailBatch ? lastEmailBatch.date : 'Never sent'}
                        </span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Recipients:</span>
                        <span className="status-value">
                            {lastEmailBatch ? lastEmailBatch.recipientsCount : 0}
                        </span>
                    </div>
                </div>
            </div>

            <div className="email-actions">
                <div className="action-card">
                    <div className="action-header">
                        <BiCalendar className="action-icon" />
                        <h3>Send Graduation Emails</h3>
                    </div>
                    <p className="action-description">
                        Send graduation emails to all high schoolers graduating this year. 
                        {!isGraduationTime && ' (Note: This is typically done in June)'}
                    </p>
                    <div className="action-buttons">
                        <button
                            className={`btn-primary ${loading ? 'loading' : ''}`}
                            onClick={handleSendGraduationEmails}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <BiRefresh className="spinning" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <BiEnvelope />
                                    Send Graduation Emails
                                </>
                            )}
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={handleSendTestEmails}
                            disabled={loading}
                        >
                            Send Test Emails
                        </button>
                    </div>
                </div>

                <div className="action-card">
                    <div className="action-header">
                        <BiRefresh className="action-icon" />
                        <h3>Migration Reminders</h3>
                    </div>
                    <p className="action-description">
                        Send reminder emails to graduates who haven't completed their alumni migration yet.
                    </p>
                    <div className="action-buttons">
                        <button
                            className="btn-secondary"
                            onClick={handleSendMigrationReminders}
                            disabled={loading}
                        >
                            <BiRefresh />
                            Send Migration Reminders
                        </button>
                    </div>
                </div>
            </div>

            <div className="email-info">
                <h3>How It Works</h3>
                <div className="info-steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h4>Automatic Scheduling</h4>
                            <p>Graduation emails are automatically sent on June 1st at 9 AM CST</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h4>Email Content</h4>
                            <p>Emails include personalized migration links and alumni benefits information</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h4>Migration Process</h4>
                            <p>Students click the link to complete their alumni account migration</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h4>Follow-up</h4>
                            <p>Reminder emails are sent to those who haven't completed migration</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="email-requirements">
                <h3>Requirements</h3>
                <ul>
                    <li>High schoolers must have a valid email address</li>
                    <li>Graduation year must be set to the current year</li>
                    <li>User type must be "High Schooler"</li>
                    <li>Migration tokens expire after 30 days</li>
                </ul>
            </div>
        </div>
    );
};

export default GraduationEmailSettings;
