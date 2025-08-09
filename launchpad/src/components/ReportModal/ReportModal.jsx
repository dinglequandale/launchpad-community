import { useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import toast from 'react-hot-toast';
import './report_modal.css';
import { useReport } from '../../contexts/report/ReportContext';
import { getFunctions, httpsCallable } from "firebase/functions";

export default function ReportModal() {
    const { reportVisibility, setReportVisibility, isSubmitting, setIsSubmitting, reportTarget, reportedUser, setReportedUser, showReportUserName, setShowReportUserName } = useReport();
    const [reportReason, setReportReason] = useState('');

    const handleReport = async () => {
        if (!reportReason.trim()) {
            toast.error('Please provide a reason for reporting');
            return;
        }

        setIsSubmitting(true);
        try {
            toast.loading('Sending report ...');
            const sendReport = httpsCallable(getFunctions(), "sendReport");
            await sendReport({ 
                reportedUser, 
                reportTarget, 
                reportReason 
            });
            
            toast.success('Report submitted successfully');
            
            setTimeout(() => {
                setReportVisibility(false);
                setReportReason('');
            }, 2000);
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
            setReportedUser("");
            setShowReportUserName(true);
        }
    };

    useEffect(() => {
        console.log(reportedUser);
    },[reportedUser])

    if (!reportVisibility) return null;

    return (
        <div className="report-modal-overlay">
            <div className="report-modal">
                <div className="report-modal-header">
                    <h3 className="report-modal-title">Report {reportTarget}</h3>
                    <button 
                        className="report-modal-close-btn" 
                        onClick={() => {
                            setShowReportUserName(true);
                            setReportedUser("");
                            setReportVisibility(false);
                        }} 
                        disabled={isSubmitting}
                    >
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                <div className="report-modal-content">
                    {showReportUserName && setReportedUser && (
                        <div className="report-modal-field">
                            <label className="report-modal-label">Reported User's Name</label>
                            <input 
                                type="text" 
                                className="report-modal-input" 
                                onChange={(e) => setReportedUser(e.target.value)} 
                                value={reportedUser} 
                                placeholder="Enter the reported user's name"
                            />
                        </div>
                    )}

                    <div className="report-modal-field">
                        <label className="report-modal-label">Reason for Report</label>
                        <textarea
                            className="report-modal-textarea"
                            placeholder="Please provide a detailed reason for reporting..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            disabled={isSubmitting}
                            rows={4}
                        />
                    </div>
                </div>

                <div className="report-modal-actions">
                    <button 
                        className="report-modal-btn report-modal-btn-secondary" 
                        onClick={() => setReportVisibility(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        className="report-modal-btn report-modal-btn-primary" 
                        onClick={handleReport}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </div>
        </div>
    )
}