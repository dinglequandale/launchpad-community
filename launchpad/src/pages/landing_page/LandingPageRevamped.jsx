import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./landingpage.css";
import { useAuth } from "../../contexts/auth/AuthContext";
import { PiBuilding, PiGraduationCap, PiStudent, PiSuitcase } from "react-icons/pi";
import Landing_Nav from "./Landing_Nav/Landing_Nav";
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useSchoolConfig } from "../../utils/subdomainUtils";
import SchoolCTAButton from "../../components/SchoolCTAButton/SchoolCTAButton";

const createUserTypes = (schoolConfig) => ({
  highschooler: {
    featureCards: schoolConfig.featureCards.highschooler.map(card => ({
      title: card.title,
      text: (
        <>
          {card.text.split(' ').map((word, index) => {
            const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
            if (cleanWord === 'connect' || cleanWord === 'find' || cleanWord === 'complete') {
              return <span key={index} className="highlight">&nbsp;{word}</span>;
            }
            return ' ' + word;
          })}
        </>
      ),
    })),
    heroTitle: (
      <>
        <span style={{ color: "var(--neutral)", textDecoration: "underline" }}>Empowerin</span>
        <span style={{ color: "var(--neutral)" }}>g</span> Student Excellence
      </>
    ),
    subheader: (
      <>
        <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>Launching</span> {schoolConfig.schoolShortName}s' youth into <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>collegiate</span> and <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>professional</span> success
      </>
    ),
    cta: schoolConfig.ctaText,
    ctaSection: schoolConfig.ctaButtonText,
    bgClass: "landing-page",
  },
  alumni: {
    featureCards: schoolConfig.featureCards.alumni.map(card => ({
      title: card.title,
      text: (
        <>
          {card.text.split(' ').map((word, index) => {
            const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
            if (cleanWord === 'connect' || cleanWord === 'follow' || cleanWord === 'help' || cleanWord === 'guide' || cleanWord === 'next' || cleanWord === 'generation' || cleanWord === 'business' || cleanWord === 'project') {
              return <span key={index} className="highlight">&nbsp;{word}</span>;
            }
            return ' ' + word;
          })}
        </>
      ),
    })),
    heroTitle: (
      <>
        <span style={{ color: "var(--neutral)", textDecoration: "underline" }}>Empowerin</span>
        <span style={{ color: "var(--neutral)" }}>g</span> Student Excellence
      </>
    ),
    subheader: (
      <>
        <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>Launching</span> {schoolConfig.schoolShortName}s' youth into <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>collegiate</span> and <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>professional</span> success
      </>
    ),
    cta: schoolConfig.ctaText,
    ctaSection: schoolConfig.ctaButtonText,
    bgClass: "landing-page-alumni",
  },
  professional: {
    featureCards: schoolConfig.featureCards.professional.map(card => ({
      title: card.title,
      text: (
        <>
          {card.text.split(' ').map((word, index) => {
            const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
            if (cleanWord === 'exceptional' || cleanWord === 'top' || cleanWord === 'colleges' || cleanWord === 'shape' || cleanWord === 'future' || cleanWord === 'limited' || cleanWord === 'powerful' || cleanWord === 'filters' || cleanWord === 'community' || cleanWord === 'internship' || cleanWord === 'positions' || cleanWord === 'volunteers' || cleanWord === 'project' || cleanWord === 'applications' || cleanWord === 'listings') {
              return <span key={index} className="highlight">&nbsp;{word}</span>;
            }
            return ' ' + word;
          })}
        </>
      ),
    })),
    heroTitle: (
      <>
        <span style={{ color: "var(--neutral)", textDecoration: "underline" }}>Empowerin</span>
        <span style={{ color: "var(--neutral)" }}>g</span> Student Excellence
      </>
    ),
    subheader: (
      <>
        <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>Launching</span> {schoolConfig.schoolShortName}s' youth into <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>collegiate</span> and <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>professional</span> success
      </>
    ),
    cta: schoolConfig.ctaText,
    ctaSection: schoolConfig.ctaButtonText,
    bgClass: "landing-page-professional",
  },
});

const createStaticContent = (schoolConfig) => ({
  WHO_ARE_WE: (
    <>
      <span style={{ fontWeight: "bolder" }}>Launchpad</span> is a <span className="highlight">free local social network</span> designed to empower {schoolConfig.schoolShortName}s' youth by creating meaningful connections among:
    </>
  ),
  
  NETWORK_GRID: [
    { icon: <PiStudent />, label: "Motivated highschoolers" },
    { icon: <PiGraduationCap />, label: "Qualified undergraduates" },
    { icon: <PiSuitcase />, label: "Experienced professionals" },
    { icon: <PiBuilding />, label: "Community organizations" },
  ],
  
  MISSION: (
    <>
      <span className="highlight">We act as a launchpad</span> for high school students' potential and passion, propelling them into college and beyond. By fostering a vibrant network of mentors, professionals, alumni, and high quality resources, we empower our youth to strengthen their portfolio of work experience and extracurriculars.
    </>
  ),
  
  GOAL: (
    <>
      Our aim is to provide {schoolConfig.schoolShortName}s' youth with 
      <br />
      <span className="highlight">accessible learning, leadership, and workplace opportunities</span>.
    </>
  ),
});

function useScrollFadeIn() {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => setIsVisible(entry.isIntersecting));
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return [domRef, isVisible];
}

export default function LandingPageRevamped() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const userTypeParam = searchParams.get("userType");
  const schoolConfig = useSchoolConfig();
  const USER_TYPES = createUserTypes(schoolConfig);
  const STATIC_CONTENT = createStaticContent(schoolConfig);
  const userType = USER_TYPES[userTypeParam] ? userTypeParam : "highschooler";
  const content = USER_TYPES[userType];

  const handleJoin = (type="Signup") => {
    if (!userLoggedIn) {
      // TODO: Remove this
      localStorage.clear();
      if(type === "Signup"){
        navigate("/Signup");
      }
      else{
        navigate("/Login");
      }

    } else {
      navigate("/Home");
    }
  };

  console.log("user logged in?: " + userLoggedIn)

  // Section fade-in hooks
  const [featureRef, featureVisible] = useScrollFadeIn();
  const [whoRef, whoVisible] = useScrollFadeIn();
  const [missionRef, missionVisible] = useScrollFadeIn();
  const [ctaRef, ctaVisible] = useScrollFadeIn();

  return (
    <>
      {userLoggedIn && <Navigate to="/Home" replace={true} />}
      <div className={content.bgClass}>
        <header className="landing-header">
          <nav className="navbar">
            <img src="/assets/launchpad_logo.png" alt="Logo" style={{ width: "20%" }} />
            <Landing_Nav />
            <div style={{ display: "flex", gap: "20px", marginRight: "10px" }}>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                <button className="authButtons btnUnfilled" onClick={() => handleJoin("Signup")}>Signup</button>
                <button className="authButtons" onClick={() => handleJoin("Login")}>Login</button>
              </div>
            </div>
          </nav>
          <div style={{ paddingTop: "30px" }}>
            <h1 className="landing-title">{content.heroTitle}</h1>
          </div>
          <p className="subheader">{content.subheader}</p>
          <SchoolCTAButton onClick={() => handleJoin()} variant="primary" />
        </header>

        <main className="main-content">
          <div className="feature-container">
            <section
              className="feature-section"
              ref={featureRef}
              style={{
                opacity: featureVisible ? 1 : 0,
                transform: featureVisible ? "none" : "translateY(50px)",
                transition: "opacity 0.8s cubic-bezier(.4,0,.2,1), transform 0.8s cubic-bezier(.4,0,.2,1)",
              }}
            >
              {content.featureCards.map((card, idx) => (
                <div className="feature-card" key={idx}>
                  <span className="pillarTitle">{card.title}</span>
                  <div className="pillarText" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <span>{card.text}</span>
                  </div>
                </div>
              ))}
            </section>
          </div>

          <section
            className="who-are-we"
            ref={whoRef}
            style={{
              opacity: whoVisible ? 1 : 0,
              transform: whoVisible ? "none" : "translateY(50px)",
              transition: "opacity 0.8s cubic-bezier(.4,0,.2,1) 0.2s, transform 0.8s cubic-bezier(.4,0,.2,1) 0.2s",
            }}
          >
            <div className="container">
              <h2 className="section-title">Who are we?</h2>
              <div className="content-wrapper">
                <p className="description">{STATIC_CONTENT.WHO_ARE_WE}</p>
                <div className="network-grid">
                  {STATIC_CONTENT.NETWORK_GRID.map((item, idx) => (
                    <div className="network-item" key={idx}>
                      <i>{item.icon}</i>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="description goal">
                  {STATIC_CONTENT.GOAL}
                </p>
              </div>
            </div>
          </section>

          <section
            className="mission-statement"
            ref={missionRef}
            style={{
              opacity: missionVisible ? 1 : 0,
              transform: missionVisible ? "none" : "translateY(50px)",
              transition: "opacity 0.8s cubic-bezier(.4,0,.2,1) 0.4s, transform 0.8s cubic-bezier(.4,0,.2,1) 0.4s",
            }}
          >
            <h2 className="mission-title">Our Mission</h2>
            <div className="mission-container" style={{marginBottom: "50px"}}>
              <p className="mission-text">{STATIC_CONTENT.MISSION}</p>
            </div>
          </section>

          <section
            className="cta-section"
            ref={ctaRef}
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? "none" : "translateY(50px)",
              transition: "opacity 0.8s cubic-bezier(.4,0,.2,1) 0.6s, transform 0.8s cubic-bezier(.4,0,.2,1) 0.6s",
            }}
          >
            <span className="next-steps-title">Ready to take the next step?</span>
            <SchoolCTAButton onClick={() => handleJoin()} variant="primary" />
          </section>

          <div style={{ display: "flex", justifyContent: "center", paddingBottom: "10px" }}>
            <img src="/assets/launchpad_logo.png" alt="Logo" style={{ width: "33%" }} />
          </div>
        </main>

        <footer className="landing-footer">
          <LegalityFooter pathName={location.pathname} />
        </footer>
      </div>
    </>
  );
} 