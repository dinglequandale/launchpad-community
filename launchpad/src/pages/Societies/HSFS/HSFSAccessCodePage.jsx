import toast from "react-hot-toast";
import SecurityCodeInput from "../../../components/Security Key/SecurityInput";
import { getFunctions, httpsCallable } from "firebase/functions";
import { HSFS_ACCESS_CODE_KEY } from "../../../services/hsfsOnboardingServices";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/auth/AuthContext";
import { useSociety } from "../../../contexts/SocietyContext";
import { useState } from "react";

export default function HSFSAccessCodePage() {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();
    const { setSociety } = useSociety();

    // Only redirect to Home if the user is already an HSFS member.
    // Existing Launchpad users who are not yet HSFS members must still go through this page.
    const basicInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}');
    const isAlreadyHSFS =
        basicInfo?.societyPrimary === 'hsfs' ||
        (Array.isArray(basicInfo?.societies) && basicInfo.societies.includes('hsfs'));

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (key) => {
        setIsSubmitting(true);
        const loadingToast = toast.loading('Verifying your code...');

        try {
            // Codes are checked server-side; the society document (codes, limits) is
            // no longer readable from the browser. The code is consumed later, when
            // the user actually joins (redeemSocietyAccessCode).
            const verify = httpsCallable(getFunctions(), 'verifySocietyAccessCode');
            const { data } = await verify({ societyId: 'hsfs', code: key });

            if (!data.valid) {
                const messages = {
                    invalid: 'Invalid code!',
                    expired: 'This code has expired. Please request a new one!',
                    limit: 'Code usage limit reached. Please contact houstonstudentfinancesociety@gmail.com for help.',
                };
                toast.error(messages[data.reason] || 'Invalid code!', { id: loadingToast });
                return;
            }

            toast.success('Access code verified!', { id: loadingToast });
            sessionStorage.setItem(HSFS_ACCESS_CODE_KEY, key);

            // Set society context
            setSociety('hsfs');

            // If already logged in, go to the lightweight HSFS join page (just interests).
            // Otherwise, proceed to full signup + onboarding.
            if (userLoggedIn) {
                navigate("/hsfs-join");
            } else {
                navigate("/Signup");
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            const message = error?.code === 'functions/resource-exhausted'
                ? 'Too many attempts. Please wait a while and try again.'
                : 'An error occurred while verifying your code';
            toast.error(message, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {userLoggedIn && isAlreadyHSFS && <Navigate to="/Home" replace />}

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
                                    Houston Finance Society
                                </h2>
                                <p className="form-subtitle" style={{ marginBottom: '8px' }}>
                                    Connecting Houston's Young Finance Leaders
                                </p>
                                <p className="form-subtitle">
                                    Enter your access code to get started
                                </p>

                                <div className="security-code-container">
                                    <SecurityCodeInput
                                        onSubmit={onSubmit}
                                        isSubmitting={isSubmitting}
                                    />
                                </div>

                                <div className="security-notice">
                                    <div className="security-notice-content">
                                        <p>
                                            <strong>Need a code?</strong> Contact HSFS at{' '}
                                            <a
                                                href="mailto:houstonstudentfinancesociety@gmail.com"
                                                className="security-link"
                                            >
                                                houstonstudentfinancesociety@gmail.com
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
