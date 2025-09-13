import { useState } from "react";
import "./signin.css";
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from "../../firebase/auth";
import { useAuth } from "../../contexts/auth/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import emailData from "../../json_data/studentEmailData.json";
import { packageBasicUserInfoToLS, pushInitialProfileCompletion } from "../../services/onboardingServices";
import { getConnectionsByStatus } from "../../services/connectionService";
import { capitalizeFirstLetter } from "../Homepage/Home";

export default function SignUp(){
    const { userLoggedIn } = useAuth();
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [userIsSigningIn, setUserIsSigningIn] = useState(false);
    const [emailValid, setEmailValid] = useState(true);
    const [emailOverride, setEmailOverride] = useState(false);
    const navigate = useNavigate();

    const userType = localStorage.getItem("userType") || '';
    const schoolInfo = localStorage.getItem("tempSchoolInfo") || '';
    const schoolId = schoolInfo ? JSON.parse(schoolInfo).schoolId : "";

    const schoolEmailCondition = userType === "High Schooler";
    const staffEmailCondition = userType === "Staff";

    // Check for school code validation
    const tempSchoolInfo = JSON.parse(localStorage.getItem("tempSchoolInfo"));
    if (!tempSchoolInfo) {
        return <Navigate to="/school-signup" replace={true}/>;
    }

    const checkSchoolEmail = (inputFrag, school) => {
        // Convert input to lowercase for case-insensitive comparison
        const lowerCaseInputFrag = inputFrag.toLowerCase();

        const foundStudent = emailData.find(student =>
          {
            return student.email_frag ? lowerCaseInputFrag.includes(student.email_frag.toLowerCase()) : false;
          }
        );
        const isEmailFound = foundStudent ? true : false;
        // If override is enabled, always set email as valid
        setEmailValid(emailOverride || isEmailFound); 
        return foundStudent;
      };

    // Function to validate email format for school emails
    const validateSchoolEmailFormat = (email, schoolId) => {
        const emailPattern = new RegExp(`^[^@]+@${schoolId}\\.org$`, 'i');
        return emailPattern.test(email);
    };

    // Fetch and store connections for new users
    const fetchAndStoreConnections = async () => {
        try {
            if (schoolId) {
                const parentPendingResult = await getConnectionsByStatus(schoolId, 'pending_parental_approval');
                const parentApprovedResult = await getConnectionsByStatus(schoolId, 'parent_approved');
                
                // Extract user IDs from the connections
                const pendingUserIds = parentPendingResult.connections?.map(conn => 
                    conn.role === 'initiator' ? conn.targetUserId : conn.initiateUserId
                ) || [];
                
                const parentApprovedUserIds = parentApprovedResult.connections?.map(conn => 
                    conn.role === 'initiator' ? conn.targetUserId : conn.initiateUserId
                ) || [];
                
                localStorage.setItem('pendingConnections', JSON.stringify(pendingUserIds));
                localStorage.setItem('approvedConnections', JSON.stringify(parentApprovedUserIds));
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };

    // Run profile completion logic for new users
    const runProfileCompletionLogic = async (userData) => {
        try {
            // Package basic user info to localStorage
            packageBasicUserInfoToLS(userData);
            
            // Push initial profile completion data
            pushInitialProfileCompletion(userData);
            
            // Fetch and store connections
            await fetchAndStoreConnections();
        } catch (error) {
            console.error('Error running profile completion logic:', error);
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const studentRecord = schoolEmailCondition ? checkSchoolEmail(userEmail, schoolId) : null;

        if(schoolEmailCondition){
            try {
                console.log('School email condition met. Override state:', emailOverride);
                console.log('User email:', userEmail);
                
                // If override is enabled, only check basic email format (not school domain)
                if (emailOverride) {
                    console.log('Override enabled - checking basic email format only');
                    // Basic email format validation when override is enabled
                    const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!basicEmailPattern.test(userEmail)) {
                        toast.error('Please enter a valid email address.');
                        return;
                    }
                    console.log('Basic email format validation passed');
                } else {
                    console.log('Override disabled - checking strict school domain validation');
                    // For non-override mode, we need to check both format AND database existence
                    
                    // Then check if the email exists in the database
                    if (!studentRecord) {
                        console.log('Email not found in database:', userEmail);
                        toast.error(`Email not found in school database. Please use your registered school email or enable the override option.`);
                        return;
                    }
                    
                    console.log('School email validation passed - email found in database');
                }
            } catch(e) {
                console.log(e);
                toast.error('School information missing. Please restart signup.');
                return;
            }
        }
        else if(staffEmailCondition){
            // Staff users can input any email - just validate basic email format
            const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!basicEmailPattern.test(userEmail)) {
                toast.error('Please enter a valid email address.');
                return;
            }
            setEmailValid(true);
        }
        else{
            setEmailValid(true);
        }
        if(userPassword.length <= 6){
            toast.error("Password must be at least 7 characters long.");
            return;
        }
        if(userPassword && userPassword !== confirmedPassword){
            toast.error("Passwords do not match. Please try again.")
            return;
        }
        
        if(!userIsSigningIn){
            setUserIsSigningIn(true);
            try {
                // console.log("Student record: ", studentRecord.graduation_year);
                
                // Save student record to localStorage - create fallback if using override
                if (schoolEmailCondition) {
                    console.log("Running school email condition");
                    if (studentRecord) {
                        console.log("Student record found");
                        console.log("Student record: ", studentRecord);
                        localStorage.setItem("tempStudentInfo", JSON.stringify(studentRecord));
                    } else if (emailOverride) {
                        // Create a minimal student record for override users
                        const fallbackRecord = {
                            full_name: "", // Will be filled in onboarding
                            graduation_year: "", // Will be filled in onboarding
                            email_frag: userEmail.split('@')[0] // Extract username part
                        };
                        localStorage.setItem("tempStudentInfo", JSON.stringify(fallbackRecord));
                    }
                } else if (staffEmailCondition) {
                    // Create a minimal record for staff users
                    const staffRecord = {
                        full_name: "", // Will be filled in onboarding
                        graduation_year: "", // Not applicable for staff
                        email_frag: userEmail.split('@')[0] // Extract username part
                    };
                    localStorage.setItem("tempStudentInfo", JSON.stringify(staffRecord));
                }
                
                const emailToUse = (schoolEmailCondition && !emailOverride) ? userEmail + emailData[0].email_hook : userEmail;
                const userCredential = await toast.promise(
                    doCreateUserWithEmailAndPassword(emailToUse, userPassword),
                    {
                        loading: 'Creating your account ...',
                        success: "Account created successfully!",
                        error: (err) => {
                            if (err.code === 'auth/email-already-in-use') {
                                return 'An account with this email already exists.';
                            } else if (err.code === 'auth/invalid-email') {
                                return 'Please enter a valid email address.';
                            } else if (err.code === 'auth/weak-password') {
                                return 'Password is too weak. Please choose a stronger password.';
                            } else if (err.code === 'auth/operation-not-allowed') {
                                return 'Email/password accounts are not enabled.';
                            } else {
                                return 'Failed to create account. Please try again.';
                            }
                        }
                    }
                );
                
                // Run profile completion logic for new users
                // if (userCredential && userCredential.user) {
                //     await runProfileCompletionLogic(studentRecord || {});
                // }
                
                navigate("/Home");
            } catch (error) {
                console.error("Error creating account:", error);
                // Error is already handled by toast.promise
            } finally {
                setUserIsSigningIn(false);
            }
        }
    }

    const onContinueWithGoogle = async (e) => {
        e.preventDefault();
        if(!userIsSigningIn){
            setUserIsSigningIn(true);
            try {
                const userCredential = await doSignInWithGoogle();
                
                // Run profile completion logic for new Google users
                // if (userCredential && userCredential.user) {
                //     await runProfileCompletionLogic({});
                // }
                
                navigate("/Home");
            } catch (error) {
                console.error("Error signing in with Google:", error);
                if (error.code === 'auth/popup-closed-by-user') {
                    toast.error("Sign-in cancelled. Please try again.");
                } else if (error.code === 'auth/popup-blocked') {
                    toast.error("Pop-up blocked. Please allow pop-ups and try again.");
                } else if (error.code === 'auth/network-request-failed') {
                    toast.error("Network error. Please check your connection and try again.");
                } else if (error.code === 'auth/account-exists-with-different-credential') {
                    toast.error("An account already exists with this email. Please sign in instead.");
                } else {
                    toast.error("Sign-in failed. Please try again.");
                }
            } finally {
                setUserIsSigningIn(false);
            }
        }
    }

    return(
        <>
        <div>
        {/* <Toaster
        position="bottom-right"
        reverseOrder={false}/> */}
        </div>
        
        {userLoggedIn && (<Navigate to='/Home' replace={true}/>)}
        <div className="auth-container">
            <div className="auth-background-blend"></div>
            <div className="auth-wrapper">
                <div className="auth-body">
                    <header className="auth-header">
                        <div className="auth-school-branding">
                            <img 
                                src="/assets/launchpad_logo.png" 
                                alt="Launchpad Logo" 
                                className="auth-school-logo"
                            />
                            <h1 className="auth-title">The {capitalizeFirstLetter(tempSchoolInfo?.schoolId) || "School"} Network</h1>
                            <p className="auth-subtitle">Your journey beyond the classroom starts here</p>
                        </div>
                        <div className="auth-powered-by">
                            <span>Powered by Launchpad Networks</span>
                        </div>
                    </header>
                    
                    <main className="auth-main">
                        <div className="auth-form-section">
                            {(!schoolEmailCondition && !staffEmailCondition) && (
                                <>
                                    <button className="auth-social-button" onClick={(e)=>onContinueWithGoogle(e)}>
                                        <svg style={{width: "20px"}} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clipPath="url(#clip0_17_40)">
                                                <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                                                <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                                                <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                                                <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_17_40">
                                                    <rect width="48" height="48" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                        <span>Continue with Google</span>
                                    </button>
                                    
                                    <div className="auth-divider">
                                        <span>OR</span>
                                    </div>
                                </>
                            )}
                            
                            <form onSubmit={(e)=>handleSubmit(e)}>
                                <div className="auth-form-group">
                                    <label className="auth-form-label">
                                        {schoolEmailCondition && !emailOverride ? "School Email" : "Email"}
                                    </label>
                                    <div className="auth-email-group">
                                        <input
                                            type="text"
                                            value={userEmail}
                                            placeholder={schoolEmailCondition && !emailOverride ? "yourname" : "Enter your email"}
                                            onChange={(e) => {
                                                setEmailValid(true);
                                                // Don't reset override state when typing - let user keep their choice
                                                if(schoolEmailCondition && !emailOverride) {
                                                    // Only restrict input when override is disabled for high schoolers
                                                    if(!(e.target.value.includes("@") || e.target.value.includes("."))){
                                                        setUserEmail(e.target.value);
                                                    }
                                                } else {
                                                    // Allow full email input when override is enabled, for staff users, or for non-school users
                                                    setUserEmail(e.target.value);
                                                }
                                            }}
                                            required
                                            disabled={userIsSigningIn}
                                            className={`auth-form-input ${!emailValid ? "error" : ""}`}
                                        />
                                        {schoolEmailCondition && !emailOverride && (
                                            <span className="auth-email-suffix">{emailData[0].email_hook}</span>
                                        )}
                                    </div>
                                    {!emailValid && !emailOverride && (
                                        <div className="auth-error-message">
                                            ❌ Please use your school email
                                        </div>
                                    )}
                                    {!emailValid && emailOverride && (
                                        <div className="auth-warning-message">
                                            ⚠️ Email validation bypassed - proceeding with signup
                                        </div>
                                    )}
                                    {schoolEmailCondition && (
                                        <div className="auth-email-override">
                                            <div style={{ 
                                                background: '#f8f9fa', 
                                                border: '1px solid #dee2e6', 
                                                borderRadius: '8px', 
                                                padding: '12px', 
                                                marginBottom: '16px',
                                                fontSize: '14px',
                                                color: '#6c757d'
                                            }}>
                                                <strong>Having trouble with school email?</strong>
                                                <br />
                                                If your email isn't in our database or you're using a different email, you can still sign up.
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newOverrideState = !emailOverride;
                                                    setEmailOverride(newOverrideState);
                                                    console.log('Email override toggled:', newOverrideState);
                                                    
                                                    if (newOverrideState) {
                                                        setEmailValid(true);
                                                        setUserEmail(""); // Clear email when enabling override
                                                    } else {
                                                        setUserEmail(""); // Clear email when disabling override
                                                        setEmailValid(true);
                                                    }
                                                }}
                                                className="auth-override-button"
                                                style={{
                                                    background: emailOverride ? '#28a745' : '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '10px 16px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {emailOverride ? "✓ Using any email address" : "Use Different Email Address"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-form-label">Password</label>
                                    <input
                                        type="password"
                                        value={userPassword}
                                        onChange={(e) => setUserPassword(e.target.value)}
                                        required
                                        className="auth-form-input"
                                    />
                                </div>

                                <div className="auth-form-group">
                                    <label className="auth-form-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmedPassword}
                                        onChange={(e) => setConfirmedPassword(e.target.value)}
                                        required
                                        className={`auth-form-input ${(userPassword && userPassword !== confirmedPassword) ? "error" : ""}`}
                                    />
                                    {(userPassword && userPassword !== confirmedPassword) && (
                                        <div className="auth-error-message">
                                            Passwords do not match
                                        </div>
                                    )}
                                </div>

                                <div className="auth-agreement-section">
                                    <label className="auth-agreement-checkbox">
                                        <input 
                                            type="checkbox" 
                                            required
                                            className="auth-checkbox-input"
                                        />
                                        <span className="auth-checkbox-text">
                                            By signing up, I agree to be contacted via email by, and only by, {tempSchoolInfo?.schoolDisplayName || "school"} students, alumni, parents, and staff. I understand that the email address I provided above will be the one they use to reach me.
                                        </span>
                                    </label>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="auth-submit-button" 
                                    disabled={userIsSigningIn}
                                >
                                    {userIsSigningIn ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                        </div>
                        
                        {!userType && (
                            <p className="auth-link">
                                Already have an account? <a href="/Login">Log in</a>
                            </p>
                        )}
                    </main>
                </div>
            </div>
        </div>
        </>
    )
}