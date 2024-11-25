import React, { useEffect, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import "./landingpage.css"
import { useAuth } from "../../contexts/auth/AuthContext";
import { PiBuilding, PiGraduationCap, PiStudent, PiSuitcase } from "react-icons/pi";
import Landing_Nav from "./Landing_Nav/Landing_Nav";

export default function Professional_LandingPage() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const handleJoin = () => {
    if(!userLoggedIn){navigate("/Login");}
    else{navigate("/Home");}
  }

  return (
    <>
    {userLoggedIn && (<Navigate to="/Home" replace={true}/>)}
    <div className="landing-page-professional">
      <header className="landing-header">
        <nav className="navbar">
          <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "20%"}} />
          <Landing_Nav/>
          <div style={{display: "flex", gap: "20px", marginRight: "10px"}}>
            {/* <ul className="nav-links">
              <li className="nav-element"><a href="#about">About</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul> */}
            <div style={{display: "flex", gap: "10px", justifyContent: "center", alignItems: "center"}}>
              <button className="authButtons btnUnfilled" onClick={()=>navigate("/Signup")}>Signup</button>
              <button className="authButtons" onClick={()=>navigate("/Login")}>Login</button>
            </div>
          </div>
        </nav>
        <div style={{paddingTop: "30px"}}>
          <h1 className="landing-title"><span style={{color: "var(--neutral)", textDecoration: "underline"}}>Empowerin</span><span style={{color: "var(--neutral)"}}>g</span> Student Excellence</h1>
        </div>
        <p className="subheader"><span style={{fontWeight: "bolder",color: "var(--neutral)",textDecoration: "underline"}}>Launching</span> Awty’s youth into <span style={{fontWeight: "bolder",color: "var(--neutral)", textDecoration: "underline"}}>collegiate</span> and <span style={{fontWeight: "bolder",color: "var(--neutral)", textDecoration: "underline"}}>professional</span> success</p>
        <button className="cta-button btnUnfilled" onClick={handleJoin}>Get Started</button>
      </header>

      <main className="main-content">
      <div className="feature-container">
        <section className="feature-section">
          <div className="feature-card">
            {/* <i className="icon-connections"></i> */}
            <span className="pillarTitle">Guide the Next Generation</span>
            <div className="pillarText" style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
            <span>
            Our platform hosts an exceptional youth studying at Awty and <span className="highlight">top U.S colleges</span> (Princeton, Carnegie Mellon, etc ...), all eager to excel. By joining Launchpad, you are empowered to <span className="highlight">shape their future</span> by offering insights, advice, and workplace opportunities.
            </span>
            </div>
          </div>
          <div className="feature-card">
            {/* <i className="icon-potential"></i> */}
            <span className="pillarTitle">Expand Your Professional Network</span>
            <div className="pillarText" style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
            <span>
            As a professional, you are certainly <span className="highlight">not limited</span> to networking with students. Indeed, Launchpad equips users with <span className="highlight">powerful search filters</span> to seamlessly connect with other professionals in the Awty community!
            </span>
            </div>
          </div>
          <div className="feature-card">
            {/* <i className="icon-community"></i> */}
            <span className="pillarTitle">Promote Opportunities</span>
            <div className="pillarText">
            <span>
            Have any <span className="highlight">internship positions</span> open? <span className="highlight">Looking for volunteers</span> for a certain project? Open to job applications? <span className="highlight">Promote your listings</span> to qualified undergraduates and/or motivated highschoolers!
            </span>
            </div>
          </div>
        </section>
        </div>
        <section className="who-are-we">
          <div className="container">
            <h2 className="section-title">Who are we?</h2>
            <div className="content-wrapper">
              <p className="description">
                <span style={{fontWeight: "bolder"}}>Launchpad</span> is a <span className="highlight">free local social network</span> designed to empower Awty's youth by creating meaningful connections among:
              </p>
              <div className="network-grid">
                <div className="network-item">
                  <i className="icon-student"><PiStudent/></i>
                  <span>Motivated highschoolers</span>
                </div>
                <div className="network-item">
                  <i className="icon-graduate"><PiGraduationCap/></i>
                  <span>Qualified undergraduates</span>
                </div>
                <div className="network-item">
                  <i className="icon-professional"><PiSuitcase/></i>
                  <span>Experienced professionals</span>
                </div>
                <div className="network-item">
                  <i className="icon-organization"><PiBuilding/></i>
                  <span>Community organizations</span>
                </div>
              </div>
              <p className="description goal">
                Our aim is to provide Awty's youth with <span className="highlight">accessible learning, leadership, and workplace opportunities</span>.
              </p>
            </div>
          </div>
        </section>
        <section className="mission-statement">
          <h2 className="mission-title">Our Mission</h2>
          <div className="mission-container">
            <p className="mission-text">
              <span className="highlight">We act as a launchpad</span> for high school students' potential and passion, propelling them into college and beyond. By fostering a vibrant network of mentors, professionals, alumni, and high quality resources, we empower our youth to strengthen their portfolio of work experience and extracurriculars.
            </p>
          </div>
        </section>

        <section className="cta-section">
        <span className="next-steps-title">Ready to take the next step?</span>
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
              <li><a onClick={() => {
                navigate("/terms", {state: location.pathname});
              }}>Terms of Service</a></li>
              <li><a onClick={() => {
                navigate("/privacy", {state: location.pathname});
              }}>Privacy Policy</a></li>
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