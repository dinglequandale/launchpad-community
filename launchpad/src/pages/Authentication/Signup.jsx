import { useState } from "react";
import "./signin.css"

export default function SignUp(){

    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        
    }

    return(
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
                
                <button className="social-button google">Continue with Google</button>
                
                <div className="divider">
                    <hr className="orDivider"/>
                    <span style={{padding: "4px", opacity: ".5"}}>OR</span>
                    <hr className="orDivider"/>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div style={{display: "flex", justifyContent: "cemter", alignItems: "center", flexDirection: "column", gap: "10px"}}>
                        <div style={{width: "100%", display: "flex", flexDirection: "column", gap: "5px"}}>
                        <span style={{color: "var(--secondary)", fontWeight: "bolder"}}>Email</span>
                        <input
                        type="email"
                        placeholder="Email address"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
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
                    <a href="#" className="forgot-password">Forgot password?</a>
                    <button type="submit" className="submit-button">Continue</button>
                </form>
                
                <p className="signup-link">
                    Already have an account? <a href="#">Log in</a>
                </p>
            </div>
      </div>
    )
}