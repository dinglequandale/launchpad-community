import { useState } from "react";
import "./signin.css";
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doPasswordReset } from "../../firebase/auth";
import { useAuth } from "../../contexts/auth/AuthContext";
import { Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function SignUp(){

    const { userLoggedIn } = useAuth();

    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userIsSigningIn, setUserIsSigningIn] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        if(!userIsSigningIn){
            setUserIsSigningIn(true);
            // await doSignInWithEmailAndPassword(userEmail, userPassword);
            
            toast.promise(doSignInWithEmailAndPassword(userEmail, userPassword), {
                loading: 'Looking for you ...',
                success: 'Logging in!',
                error: "Error! We couldn't find you.",
              });
        }

    }

    const onContinueWithGoogle = (e) => {
        e.preventDefault();
        if(!userIsSigningIn){
            setUserIsSigningIn(true);
            doSignInWithGoogle().catch(error => {
                setUserIsSigningIn(false);
                toast.error("Sorry! There was an issue signing you in. Try again!");
            })
        }
    }

    return(
        <>
        <div>
        <Toaster
        position="bottom-right"
        reverseOrder={false}/>
        </div>
        
        {userLoggedIn && (<Navigate to='/Home' replace={true}/>)}
        <div className="signup-container">
            <div className="signup-card">
                <div style={{textAlign: "center", paddingBottom: "8px"}}><span style={{color: "var(--secondary)", fontSize: "30px", fontWeight: "600"}}>Welcome to</span></div>
                <div style={{background: "var(--accent)", borderRadius: "25px", boxShadow: "var(--shadowColor)",
                    display: "flex", justifyContent: "center", alignItems: "center", height: "100px"}}>
                    <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "100%"}}/>
                </div>
                <div style={{textAlign: "center", fontWeight: "350"}}>
                    <p>Your journey starts here!</p>
                </div>
                
                <button className="social-button google" onClick={(e)=>onContinueWithGoogle(e)}>
                    <svg style={{width: "25px"}} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    <span style={{fontSize: "larger", fontWeight: "500"}}>Continue with Google</span>
                </button>
                
                <div className="divider">
                    <hr className="orDivider"/>
                    <span style={{padding: "4px", opacity: ".5"}}>OR</span>
                    <hr className="orDivider"/>
                </div>
                
                <form onSubmit={(e)=>handleSubmit(e)}>
                    <div style={{display: "flex", justifyContent: "cemter", alignItems: "center", flexDirection: "column", gap: "10px"}}>
                        <div style={{width: "100%", display: "flex", flexDirection: "column", gap: "5px"}}>
                        <span style={{color: "var(--secondary)", fontWeight: "bolder"}}>Email</span>
                        <input
                        type="email"
                        placeholder="Email address"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
                        disabled={userIsSigningIn}
                        className="inputEmailAndPassword"
                        />
                        </div>

                        <div style={{width: "100%", display: "flex", flexDirection: "column", gap: "5px"}}>
                        <span style={{color: "var(--secondary)", fontWeight: "bolder"}}>Password</span>
                        <input
                        type="password"
                        placeholder="Password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        required
                        className="inputEmailAndPassword"
                        />
                        </div>
                    </div>
                    <a href="#" className="forgot-password" disabled={userIsSigningIn}>Forgot password?</a>
                    <button type="submit" className="submit-button" disabled={userIsSigningIn}><span style={{fontSize: "larger"}} disabled={userIsSigningIn}>{userIsSigningIn ? 'Signing In...' : 'Continue'}</span></button>
                </form>
                
                <p className="signup-link">
                    Already have an account? <a href="#" disabled={userIsSigningIn}>Log in</a>
                </p>
            </div>
      </div>
      </>
    )
}