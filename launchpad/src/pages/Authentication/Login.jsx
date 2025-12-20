import { useState } from "react";
import "./SignIn.css";
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doPasswordReset } from "../../firebase/auth";
import { useAuth } from "../../contexts/auth/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { loadUserData } from "../../services/userProfileServices";
import { packageBasicUserInfoToLS, pushInitialProfileCompletion } from "../../services/onboardingServices";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { getConnectionsByStatus } from "../../services/connectionService";

export default function Login(){
    const { userLoggedIn, currentUser } = useAuth();
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userData, setUserData] = useState(null);
    const [userIsSigningIn, setUserIsSigningIn] = useState(false);

    // COMMUNITY VERSION: Removed school code validation
    // const tempSchoolInfo = JSON.parse(localStorage.getItem("tempSchoolInfo"));
    // if (!tempSchoolInfo) {
    //     return <Navigate to="/school-signup" replace={true}/>;
    // }

    const updateBasicUserData = async (user) => {
        if (!user || !user.uid) {
            throw new Error('User or user ID is undefined after login');
        }

        const userDataPromise = new Promise((resolve) => {
            loadUserData(user, () => {}, (newUserData) => {
                setUserData(newUserData);
                resolve(newUserData);
            });
        });

        const newUserData = await userDataPromise;

        if (!newUserData) {
            throw new Error('Failed to load user data');
        }

        packageBasicUserInfoToLS(newUserData);
    };

    // COMMUNITY VERSION: Check if user exists in Firebase collection
    const checkUserExists = async (uid) => {
        try {
            // Use flat users collection (no tenant isolation)
            const userDoc = await getDoc(doc(db, "users", uid));
            return userDoc.exists();
        } catch (error) {
            console.error("Error checking user existence:", error);
            return false;
        }
    };

    // COMMUNITY VERSION: Fetch and store connections for existing users
    const fetchAndStoreConnections = async () => {
        try {
            // Fetch approved connections (no schoolId or parent approval states)
            const approvedResult = await getConnectionsByStatus('approved');

            // Extract user IDs from the connections
            const approvedUserIds = approvedResult.connections?.map(conn =>
                conn.role === 'initiator' ? conn.targetUserId : conn.initiateUserId
            ) || [];

            localStorage.setItem('approvedConnections', JSON.stringify(approvedUserIds));
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };

    // Run profile completion logic for existing users
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
        if (!userIsSigningIn) {
            setUserIsSigningIn(true);
            try {
                const userCredential = await toast.promise(
                    doSignInWithEmailAndPassword(userEmail, userPassword),
                    {
                        loading: 'Logging you in ...',
                        success: "Welcome back!",
                        error: (err) => {
                            if (err.code === 'auth/user-not-found') {
                                return 'Account not found. Please check your email or sign up.';
                            } else if (err.code === 'auth/wrong-password') {
                                return 'Incorrect password. Please try again.';
                            } else if (err.code === 'auth/invalid-email') {
                                return 'Please enter a valid email address.';
                            } else if (err.code === 'auth/too-many-requests') {
                                return 'Too many failed attempts. Please try again later.';
                            } else {
                                return 'Login failed. Please try again.';
                            }
                        }
                    }
                );
    
                const user = userCredential.user;
                await updateBasicUserData(user);
                
                // Run profile completion logic for existing users
                await runProfileCompletionLogic(userData);
    
                navigate('/Home');
            } catch (error) {
                console.error("Error logging in:", error);
                // Error is already handled by toast.promise
            } finally {
                setUserIsSigningIn(false);
            }
        }
    }

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            await toast.promise(
                doPasswordReset(userEmail),
                {
                    loading: 'Sending password reset email ...',
                    success: "Password reset email sent. Check your email!",
                    error: (err) => {
                        if (err.code === 'auth/user-not-found') {
                            return 'No account found with this email.';
                        } else if (err.code === 'auth/invalid-email') {
                            return 'Please enter a valid email address.';
                        } else {
                            return 'Failed to send reset email. Please try again.';
                        }
                    }
                }
            );
        } catch (error) {
            console.error("Error sending password reset:", error);
            // Error is already handled by toast.promise
        }
    }

    const onContinueWithGoogle = async (e) => {
        e.preventDefault();
        if (!userIsSigningIn) {
            setUserIsSigningIn(true);
            try {
                const userCredential = await doSignInWithGoogle();
                const user = userCredential.user;
    
                // Check if user exists in Firebase collection
                const userExists = await checkUserExists(user.uid);
                if (!userExists) {
                    toast.error("Account not found. Please contact your administrator to set up your account.");
                    // Sign out the user since they don't have access
                    await auth.signOut();
                    return;
                }
    
                await updateBasicUserData(user);
                
                // Run profile completion logic for existing users
                await runProfileCompletionLogic(userData);
    
                navigate('/Home');
            } catch (error) {
                console.error("Error signing in with Google:", error);
                if (error.code === 'auth/popup-closed-by-user') {
                    toast.error("Sign-in cancelled. Please try again.");
                } else if (error.code === 'auth/popup-blocked') {
                    toast.error("Pop-up blocked. Please allow pop-ups and try again.");
                } else if (error.code === 'auth/network-request-failed') {
                    toast.error("Network error. Please check your connection and try again.");
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
                        <div className="auth-logo-container">
                            <img 
                                src="/assets/launchpad_logo_v2.png" 
                                alt="Launchpad Logo" 
                                className="auth-logo"
                            />
                        </div>
                        <h1 className="auth-title">Welcome back to Launchpad</h1>
                        <p className="auth-subtitle">Empowering Student Excellence</p>
                    </header>
                    
                    <main className="auth-main">
                        <div className="auth-form-section">
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
                            
                            <form onSubmit={(e)=>handleSubmit(e)}>
                                <div className="auth-form-group">
                                    <label className="auth-form-label">Email</label>
                                    <input
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        required
                                        disabled={userIsSigningIn}
                                        className="auth-form-input"
                                    />
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
                                
                                <a href="#" className="auth-forgot-password" onClick={(e)=>handlePasswordReset(e)} disabled={userIsSigningIn}>
                                    Forgot password?
                                </a>
                                
                                <button 
                                    type="submit" 
                                    className="auth-submit-button" 
                                    disabled={userIsSigningIn}
                                >
                                    {userIsSigningIn ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>
                        </div>
                        
                        <p className="auth-link">
                            Don't have an account? <a href="/Signup">Sign up</a>
                        </p>
                    </main>
                </div>
            </div>
        </div>
        </>
    )
}