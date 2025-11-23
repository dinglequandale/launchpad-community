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
    const navigate = useNavigate();

    const userType = localStorage.getItem("userType") || '';

    // COMMUNITY VERSION: Removed school email validation and school code checks
    const schoolEmailCondition = false;
    const staffEmailCondition = false;
    const tempSchoolInfo = null;


    const handleSubmit = async (e) => {
        e.preventDefault();
        // COMMUNITY VERSION: Simplified - removed all school-specific validation

        // Basic email format validation
        const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!basicEmailPattern.test(userEmail)) {
            toast.error('Please enter a valid email address.');
            return;
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
                const userCredential = await toast.promise(
                    doCreateUserWithEmailAndPassword(userEmail, userPassword),
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

                // Navigate to user type selection after successful signup
                navigate("/user-type");
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

                // Navigate to user type selection after successful signup
                navigate("/user-type");
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
                            {/* <h1 className="auth-title">Launchpad Network</h1> */}
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
                                        Email
                                    </label>
                                    <div className="auth-email-group">
                                        <input
                                            type="email"
                                            value={userEmail}
                                            placeholder="Enter your email"
                                            onChange={(e) => setUserEmail(e.target.value)}
                                            required
                                            disabled={userIsSigningIn}
                                            className="auth-form-input"
                                        />
                                    </div>
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
                                            By signing up, I agree to be contacted via email by other Launchpad users. I understand that the email address I provided above will be the one they use to reach me.
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