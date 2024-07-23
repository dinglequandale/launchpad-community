import React from "react"
import { Navigate, useNavigate } from "react-router-dom"
import "./landingpage.css"
import { useAuth } from "../../contexts/auth/AuthContext";

export default function LandingPage() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleJoin = () => {
    if(!userLoggedIn){navigate("/Onboarding");}
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
          <h1 className="landing-title"><span style={{color: "var(--neutral)", textDecoration: "underline"}}>Launch</span> Your Career Into the Future</h1>
        </div>
        <p className="subheader"><span style={{fontWeight: "bolder",color: "var(--neutral)",textDecoration: "underline"}}>Connect</span> with professionals and <span style={{fontWeight: "bolder",color: "var(--neutral)", textDecoration: "underline"}}>gain</span> valuable on-site job experience</p>
        <button className="cta-button btnUnfilled" onClick={handleJoin}>Get Started</button>
      </header>

      <main className="main-content">
        <section className="feature-section">
          <div className="feature-card">
            <i className="icon-connections"></i>
            <h2 style={{color: "var(--secondary)"}}>Seamless Connections</h2>
            <p>
              Discover how easy it is to connect with industry professionals. With just one click, you open the door to a world of opportunities and meaningful experiences.
            </p>
          </div>
          <div className="feature-card">
            <i className="icon-potential"></i>
            <h2 style={{color: "var(--secondary)"}}>Unlock Your Potential</h2>
            <p>
              Our platform is designed to empower high school students, providing access to invaluable connections and real-world job experiences that shape your future.
            </p>
          </div>
          <div className="feature-card">
            <i className="icon-community"></i>
            <h2 style={{color: "var(--secondary)"}}>Join the Revolution</h2>
            <p>
              Be part of a community that values your growth. Sign up now, go through our seamless onboarding process, and start your journey to a brighter future.
            </p>
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