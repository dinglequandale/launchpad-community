import React, { createContext, useContext, useState } from 'react';

const ReportContext = createContext();

export function ReportProvider({ children }) {
    const [reportVisibility, setReportVisibility] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportTarget, setReportTarget] = useState('User');
    const [reportedUser, setReportedUser] = useState('');
    const [showReportUserName, setShowReportUserName] = useState(true);

    return (
        <ReportContext.Provider value={{
            reportVisibility,
            setReportVisibility,
            isSubmitting,
            setIsSubmitting,
            reportTarget,
            setReportTarget,
            reportedUser,
            setReportedUser,
            showReportUserName,
            setShowReportUserName,
        }}>
            {children}
        </ReportContext.Provider>
    );
}

export function useReport() {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error('useReport must be used within a ReportProvider');
    }
    return context;
} 