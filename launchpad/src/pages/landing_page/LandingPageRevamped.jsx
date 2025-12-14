import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./LandingPage.css";
import { useAuth } from "../../contexts/auth/AuthContext";
import { PiBuilding, PiGraduationCap, PiStudent, PiSuitcase, PiRocket, PiNetwork, PiUsers, PiLightbulb, PiArrowRight, PiTrendUp } from "react-icons/pi";
import Landing_Nav from "./Landing_Nav/Landing_Nav";
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useSchoolConfig } from "../../utils/subdomainUtils";
import SchoolCTAButton from "../../components/SchoolCTAButton/SchoolCTAButton";
import { motion } from "framer-motion";

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
        <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>Launching</span> {schoolConfig.schoolShortName} youth into <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>collegiate</span> and <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>professional</span> success
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
        <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>Launching</span> {schoolConfig.schoolShortName} youth into <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>collegiate</span> and <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>professional</span> success
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
        <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>Launching</span> {schoolConfig.schoolShortName} youth into <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>collegiate</span> and <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>professional</span> success
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
      <span style={{ fontWeight: "bolder" }}>Launchpad</span> is a <span className="highlight">free local social network</span> designed to empower {schoolConfig.schoolShortName} youth by creating meaningful connections among:
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
      Our aim is to provide {schoolConfig.schoolShortName} youth with 
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
      <div className="modern-landing">
        {/* Modern Navbar */}
        <nav className="modern-navbar">
          <div className="modern-navbar-container">
            <img src="/assets/launchpad_logo.png" alt="Logo" className="modern-logo" />
            <Landing_Nav />
            <div className="modern-auth-buttons">
              <button className="modern-btn modern-btn-outline" onClick={() => handleJoin("Login")}>
                Login
              </button>
              <button className="modern-btn modern-btn-primary" onClick={() => handleJoin("Signup")}>
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section with Earth Background */}
        <section className="modern-hero">
          <div className="modern-hero-container">
            <div className="modern-hero-grid">
              {/* Left Column - Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
                className="modern-hero-content"
              >
                {/* <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="modern-badge"
                >
                  <PiNetwork className="modern-badge-icon" />
                  <span>CONNECTING COMMUNITIES</span>
                </motion.div> */}

                <h1 className="modern-hero-title">
                  Empowering Student
                  <span className="modern-hero-gradient"> Excellence</span>
                </h1>

                <p className="modern-hero-subtitle">
                  Launching {schoolConfig.schoolShortName} youth into collegiate and professional success through meaningful connections and real opportunities.
                </p>

                <div className="modern-hero-buttons">
                  <button className="modern-hero-btn-primary" onClick={() => handleJoin("Signup")}>
                    <span>Join the Network</span>
                    <PiArrowRight className="modern-btn-icon" />
                  </button>
                  {/* <button className="modern-hero-btn-secondary" onClick={() => handleJoin("Login")}>
                    Sign In
                  </button> */}
                </div>
              </motion.div>

              {/* Right Column - Earth Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.645, 0.045, 0.355, 1] }}
                className="modern-hero-image-container"
              >
                <div className="modern-hero-image-wrapper">
                  <img
                    src="/assets/earth_connect_landing.jpg"
                    alt="Global Network"
                    className="modern-hero-image"
                  />
                  <div className="modern-hero-image-glow"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="modern-features">
          <div className="modern-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="modern-section-header"
            >
              <h2 className="modern-section-title">Why Choose Launchpad?</h2>
              <p className="modern-section-subtitle">
                Everything you need to build your future, all in one platform
              </p>
            </motion.div>

            <div className="modern-features-grid">
              {content.featureCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="modern-feature-card"
                >
                  <div className="modern-feature-icon">
                    {idx === 0 && <PiUsers />}
                    {idx === 1 && <PiLightbulb />}
                    {idx === 2 && <PiRocket />}
                  </div>
                  <h3 className="modern-feature-title">{card.title}</h3>
                  <p className="modern-feature-text">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section with Rocket Background */}
        <section className="modern-stats">
          <div className="modern-stats-background">
            <img src="/assets/rocket_landing.jpg" alt="Launch" className="modern-stats-image" />
            <div className="modern-stats-overlay"></div>
          </div>
          <div className="modern-container modern-stats-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="modern-stats-title"
            >
              Launching Careers, Building Futures
            </motion.h2>

            <div className="modern-stats-grid">
              {STATIC_CONTENT.NETWORK_GRID.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="modern-stat-card"
                >
                  <div className="modern-stat-icon">{item.icon}</div>
                  <p className="modern-stat-label">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="modern-mission">
          <div className="modern-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="modern-mission-card"
            >
              <h2 className="modern-mission-title">Our Mission</h2>
              <p className="modern-mission-text">{STATIC_CONTENT.MISSION}</p>
              <div className="modern-mission-highlight">
                <PiTrendUp className="modern-mission-icon" />
                <p>{STATIC_CONTENT.GOAL}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="modern-cta">
          <div className="modern-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="modern-cta-card"
            >
              <h2 className="modern-cta-title">Ready to Launch Your Future?</h2>
              <p className="modern-cta-subtitle">
                Join our community of ambitious students, successful alumni, and industry professionals.
              </p>
              <button className="modern-cta-button" onClick={() => handleJoin("Signup")}>
                <span>Get Started Today</span>
                <PiArrowRight className="modern-btn-icon" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="modern-footer">
          <div className="modern-footer-content">
            <img src="/assets/launchpad_logo.png" alt="Logo" className="modern-footer-logo" />
          </div>
          <LegalityFooter pathName={location.pathname} />
        </footer>
      </div>
    </>
  );
} 