import toast, { Toaster } from "react-hot-toast";
import SecurityCodeInput from "../../../components/Security Key/SecurityInput";
import { collection, doc, getDocs, query, updateDoc, where, or } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/auth/AuthContext";
import { useState } from "react";

export default function PrivateKeyPage() {
    let schoolId, schoolDisplayName;
    const navigate = useNavigate();
    const {userLoggedIn, currentUser} = useAuth();
    const today = (new Date()).toLocaleDateString('en-US');
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (key) => {
        setIsSubmitting(true);
        const loadingToast = toast.loading('Verifying your code...');
        
        try {
            const schoolsRef = collection(db, "school_configs");
            const querySnapshot = await getDocs(schoolsRef);
            let matchedKeyType = null;
            let matchedDoc = null;
            let codeData = null;

            querySnapshot.forEach(docSnap => {
                const keys = docSnap.data().secret_keys || {};
                for (const [type, value] of Object.entries(keys)) {
                    if (value === key) {
                        matchedKeyType = type;
                        matchedDoc = docSnap;
                        codeData = docSnap.data();
                        break;
                    }
                }
            });

            if (!matchedDoc) {
                toast.error(`Invalid code!`, { id: loadingToast });
                return;
            }
            
            // expiration date in timestamp on Firestore
            if (codeData.expiration_date?.toDate && new Date() > codeData.expiration_date.toDate()) {
                toast.error("This code has expired. Please request a new one!");
                return;
            }
            
            if((codeData.usages_threshold <= codeData.usages_count) || codeData.daily_usages_threshold <= codeData.daily_usage_tracker[today]){
                toast.error("Code usages limit reached. Please contact us at launchpadhelpline@gmail.com for help.");
                await updateDoc(doc(db, "school_configs", matchedDoc.id), {threshold_breached: true});
                return;
            }
                        
            schoolId = matchedDoc.id;
            schoolDisplayName = codeData.display_name;
            
            toast.success('We found your school!', { id: loadingToast });

            localStorage.setItem("tempSchoolInfo", JSON.stringify({schoolId, schoolDisplayName, userRole: matchedKeyType}));

            await updateDoc(
                doc(db, "school_configs", schoolId), 
                {
                    last_used: new Date(), 
                    usages_count: codeData.usages_count + 1, 
                    daily_usage_tracker: {...codeData.daily_usage_tracker, [today]: codeData.daily_usage_tracker[today] ? codeData.daily_usage_tracker[today] + 1 : 1}
                }
            );
            if(matchedKeyType === "admin"){
                localStorage.setItem("userType", "Staff");
                navigate("/Signup", {state: {schoolId, schoolDisplayName, userRole: matchedKeyType}})
            }
            else if(matchedKeyType === "general"){
                navigate("/user-type", {state: {schoolId, schoolDisplayName, userRole: matchedKeyType}});
            }
        } catch (error) {
            console.error('Error changing:', error);
            toast.error('An error occurred while verifying your code', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    }

    return(
        <>
            <Toaster position="bottom-right" reverseOrder={false} />
            {localStorage.getItem("tempSchoolInfo") && <Navigate to="/Login"/>}
            
            <div className="onboarding-container">
                <div className="background-blend"></div>
                <div className="onboarding-wrapper">
                    <div className="onboarding-body">
                        <header className="onboarding-header">
                            <div className="onboarding-logo-container">
                                <img 
                                    src="/assets/launchpad_logo.png" 
                                    alt="Launchpad Logo" 
                                    className="onboarding-logo"
                                />
                            </div>
                        </header>
                        
                        <main className="onboarding-main">
                            <div className="form-section">
                                <h2 className="page-title">School Security Key</h2>
                                <p className="form-subtitle">
                                    Enter your school's security code to get started
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
                                            <strong>Need a code?</strong> Contact your school administrator or email us at{' '}
                                            <a 
                                                href="mailto:launchpadhelpline@gmail.com" 
                                                className="security-link"
                                            >
                                                launchpadhelpline@gmail.com
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
    )
}