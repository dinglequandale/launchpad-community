import toast from "react-hot-toast";
import SecurityCodeInput from "../../../components/Security Key/SecurityInput";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/auth/AuthContext";
import { useSociety } from "../../../contexts/SocietyContext";
import { useState } from "react";

export default function HSFSAccessCodePage() {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();
    const { setSociety } = useSociety();
    const today = (new Date()).toLocaleDateString('en-US');

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
            const societyRef = doc(db, "societies", "hsfs");
            const societyDoc = await getDoc(societyRef);

            if (!societyDoc.exists()) {
                toast.error('Society not found. Please contact support.', { id: loadingToast });
                return;
            }

            const data = societyDoc.data();
            const accessCodes = data.accessCodes || {};

            let matchedKeyType = null;
            for (const [type, value] of Object.entries(accessCodes)) {
                if (value === key) {
                    matchedKeyType = type;
                    break;
                }
            }

            if (!matchedKeyType) {
                toast.error('Invalid code!', { id: loadingToast });
                return;
            }

            // Check expiration
            if (data.expiration_date?.toDate && new Date() > data.expiration_date.toDate()) {
                toast.error("This code has expired. Please request a new one!", { id: loadingToast });
                return;
            }

            // Check usage limits
            if ((data.usages_threshold <= data.usages_count) ||
                (data.daily_usages_threshold <= (data.daily_usage_tracker?.[today] || 0))) {
                toast.error("Code usage limit reached. Please contact houstonstudentfinancesociety@gmail.com for help.", { id: loadingToast });
                return;
            }

            toast.success('Access code verified!', { id: loadingToast });

            // Set society context
            setSociety('hsfs');

            // Update usage tracking
            await updateDoc(societyRef, {
                last_used: new Date(),
                usages_count: (data.usages_count || 0) + 1,
                daily_usage_tracker: {
                    ...data.daily_usage_tracker,
                    [today]: (data.daily_usage_tracker?.[today] || 0) + 1
                }
            });

            // If already logged in, go to the lightweight HSFS join page (just interests).
            // Otherwise, proceed to full signup + onboarding.
            if (userLoggedIn) {
                navigate("/hsfs-join");
            } else {
                navigate("/Signup");
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            toast.error('An error occurred while verifying your code', { id: loadingToast });
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
