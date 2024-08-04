import React from "react"
import { Navigate, useNavigate } from "react-router-dom"
import "./landingpage.css"
import { useAuth } from "../../contexts/auth/AuthContext";

export default function LandingPage() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleJoin = () => {
    if(!userLoggedIn){navigate("/Login");}
    else{navigate("/Home");}
  }

  return (
    <>
    {userLoggedIn && (<Navigate to="/Home" replace={true}/>)}
    <div className="landing-page">
      <header className="landing-header">
        <nav className="navbar">
          <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "20%"}} />
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
        <div style={{paddingTop: "30px"}}>
          <h1 className="landing-title"><span style={{color: "var(--neutral)", textDecoration: "underline"}}>Empowering</span> Student Excellence</h1>
        </div>
        <p className="subheader"><span style={{fontWeight: "bolder",color: "var(--neutral)",textDecoration: "underline"}}>Launching</span> Houston’s youth into <span style={{fontWeight: "bolder",color: "var(--neutral)", textDecoration: "underline"}}>collegiate</span> and <span style={{fontWeight: "bolder",color: "var(--neutral)", textDecoration: "underline"}}>professional</span> success</p>
        <button className="cta-button btnUnfilled" onClick={handleJoin}>Get Started</button>
      </header>

      <main className="main-content">
        <section className="feature-section">
          <div className="feature-card">
            {/* <i className="icon-connections"></i> */}
            <span className="pillarTitle">Make Invaluable Connections</span>
            <div className="pillarText" style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
            <span>
            <span className="txtEmphasis">Connect</span> with industry professionals, undergraduates at your dream school, and like-minded peers— all committed to helping you. With just one click, you gain access to a world of opportunities.
            </span>
            </div>
          </div>
          <div className="feature-card">
            {/* <i className="icon-potential"></i> */}
            <span className="pillarTitle">Discover Meaningful Opportunities</span>
            <div className="pillarText" style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
            <span>
            <span className="txtEmphasis">Find</span> volunteer and leadership positions at community organizations, in line with your interests. Discover workplace opportunities while learning from undergrads and professionals who have done what you want to do!
            </span>
            </div>
          </div>
          <div className="feature-card">
            {/* <i className="icon-community"></i> */}
            <span className="pillarTitle">Explore Careers & Colleges</span>
            <div className="pillarText">
            <span>
            <span className="txtEmphasis">Complete</span> reputed surveys to find the careers that best suit you. Connect with undergrads and professionals in your fields of interest to gain insight on college and work life. Explore shadow, intern, and job opportunities.
            </span>
            </div>
          </div>
        </section>

        <section className="mission-statement">
          <span style={{fontSize: "50px", fontWeight: "250"}}>Our Mission</span>
          <div className="mission-container">
            <p>
            <span style={{fontSize: "25px", fontWeight: "bolder"}}>We act as a launchpad</span> for high school students' potential and passion, propelling them into college and beyond by fostering a vibrant network of mentors, professionals, alumni, and other resources, empowering them to strengthen their portfolio of <br />work experience and extracurriculars.
            </p>
          </div>
        </section>

        <section className="cta-section">
        <span style={{fontSize: "30px", fontWeight: "250"}}>Ready to take the next step?</span>
          <button className="cta-button btnUnfilled" onClick={handleJoin}>Sign Up Now</button>
        </section>
        <div style={{display: "flex", justifyContent: "center", paddingBottom: "10px"}}>
        <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "33%"}}/>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <ul>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Legal</h3>
            <ul>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Connect</h3>
            <div className="social-icons">
              {/* Add social media icons here */}
            </div>
          </div>
        </div>
        <p className="copyright">&copy; 2024 Launchpad. All rights reserved.</p>
      </footer>
    </div>
    </>
  );
}