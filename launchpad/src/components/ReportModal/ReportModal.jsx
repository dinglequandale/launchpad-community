import { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import toast from 'react-hot-toast';
import './report_modal.css';
import { useReport } from '../../contexts/report/ReportContext';

export default function ReportModal() {
    const { reportVisibility, setReportVisibility, isSubmitting, setIsSubmitting, reportTarget, reportedUser, setReportedUser, showReportUserName } = useReport();
    const [reportReason, setReportReason] = useState('');

    const handleReport = async () => {
        if (!reportReason.trim()) {
            toast.error('Please provide a reason for reporting');
            return;
        }

        setIsSubmitting(true);
        try {
            const mailtoLink = `mailto:launchpadhelpline@gmail.com?subject=Report addressed to ${reportedUser} for ${reportTarget}&body=Report Reason: ${reportReason}`;
            window.location.href = mailtoLink;
            
            toast.success('Report submitted successfully');
            
            setTimeout(() => {
                setReportVisibility(false);
                setReportReason('');
            }, 2000);
        } catch (error) {
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        console.log(reportedUser);
    },[reportedUser])

    if (!reportVisibility) return null;

    return (
        <div className="reportDialogContainer">
            <button className='btnClose' onClick={() => setReportVisibility(false)} style={{background:"none"}}><CgClose size={25}/></button>
            <div className="reportDialog" style={{gap: "20px"}}>
                <h3>Report {reportTarget}</h3>
                {showReportUserName && <input type="text" onChange={(e) => setReportedUser(e.target.value)} value={reportedUser} placeholder="Input the reported user's name" style={{width: "95%", padding: "10px", fontSize: "18px"}} />}
                <textarea
                    placeholder="Please provide a reason for reporting..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    disabled={isSubmitting}
                />
                <div className="reportActions">
                    <button 
                        className='btnUnfilled' 
                        onClick={() => setReportVisibility(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        className='btnSaveChanges' 
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