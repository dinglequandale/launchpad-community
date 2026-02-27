import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useSociety } from '../../../contexts/SocietyContext';
import { HSFS_INDUSTRIES } from '../../../utils/hsfsConstants';
import { enrollExistingUserInHSFS } from '../../../services/hsfsOnboardingServices';
import PageLoading from '../../../components/LoadingAnimation/PageLoading';
import toast from 'react-hot-toast';
import '../../Onboarding/Onboarding.css';

/**
 * Shown to existing Launchpad users who are joining HSFS for the first time.
 * They have already verified the HSFS access code, so we only need their
 * finance interests — all other profile data already exists.
 */
export default function HSFSJoinPage() {
    const { userLoggedIn, currentUser } = useAuth();
    const { currentSociety } = useSociety();
    const navigate = useNavigate();

    const [selectedInterests, setSelectedInterests] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine if the user is already an HSFS member from localStorage
    const basicInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}');
    const isAlreadyHSFS =
        basicInfo?.societyPrimary === 'hsfs' ||
        (Array.isArray(basicInfo?.societies) && basicInfo.societies.includes('hsfs'));

    // Guard: must be logged in
    if (!userLoggedIn) return <Navigate to="/Login" replace />;

    // Guard: if already enrolled, no need to be here
    if (isAlreadyHSFS) return <Navigate to="/Home" replace />;

    // Guard: only reachable when HSFS is active
    if (currentSociety !== 'hsfs') return <Navigate to="/Home" replace />;

    const toggleInterest = (value) => {
        setSelectedInterests(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const handleSubmit = async () => {
        if (selectedInterests.length === 0) {
            toast.error('Please select at least one area of interest.');
            return;
        }

        setIsSubmitting(true);
        try {
            await enrollExistingUserInHSFS(currentUser, selectedInterests);
            toast.success('Welcome to HSFS!');
            navigate('/Home');
        } catch (error) {
            console.error('Error enrolling in HSFS:', error);
            toast.error('Something went wrong. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) return <PageLoading />;

    return (
        <div className="onboarding-container">
            <div className="background-blend"></div>
            <div className="onboarding-wrapper">
                <div className="onboarding-body">
                    <header className="onboarding-header">
                        <div className="onboarding-logo-container">
                            <img
                                src="/assets/launchpad_logo_v2.png"
                                alt="HSFS Logo"
                                className="onboarding-logo"
                            />
                        </div>
                    </header>

                    <main className="onboarding-main">
                        <div className="form-section">
                            <h2 className="page-title" style={{ fontSize: '1.3rem', color: '#1a365d' }}>
                                Almost there, {basicInfo?.userName?.split(' ')[0] || 'there'}!
                            </h2>
                            <p className="form-subtitle" style={{ marginBottom: '20px' }}>
                                Since you already have a Launchpad account, we just need to know your
                                finance interests to complete your HSFS membership.
                            </p>

                            <div className="form-group">
                                <label className="form-label">
                                    Which areas of finance interest you?
                                    <span className="required">*</span>
                                </label>
                                <div className="contact-sharing-container" style={{ marginTop: '12px' }}>
                                    {HSFS_INDUSTRIES.map((industry) => (
                                        <div className="radio-option" key={industry.value}>
                                            <label
                                                className="radio-label"
                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={industry.label}
                                                    checked={selectedInterests.includes(industry.label)}
                                                    onChange={() => toggleInterest(industry.label)}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        accentColor: '#1a365d',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                                <span>{industry.label}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer className="onboarding-footer">
                        <div className="footer-right">
                            {selectedInterests.length === 0 && (
                                <p className="validation-message">
                                    Please select at least one interest (*)
                                </p>
                            )}
                            <button
                                className={`continueButton ${selectedInterests.length === 0 ? 'disabled' : ''}`}
                                onClick={handleSubmit}
                                disabled={selectedInterests.length === 0}
                            >
                                Join HSFS
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
