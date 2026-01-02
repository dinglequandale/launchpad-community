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
  sixDegrees: {
    featureCards: [
      {
        title: "World-Class Mentorship",
        text: "Connect with leading economists, psychologists, and award-winning science writers for FREE mentorship",
      },
      {
        title: "Research & Writing Support",
        text: "Get expert guidance on research papers, independent projects, writing portfolios, and competition prep",
      },
      {
        title: "Long-Term Academic Growth",
        text: "Build lasting relationships with professors and writers who are invested in your academic journey",
      },
    ],
    heroTitle: (
      <>
        Launchpad
        <span className="modern-hero-gradient"> 6 Degrees</span>
      </>
    ),
    subheader: "Connect with top university professors and award-winning writers. Receive FREE mentorship from experts in economics, psychology, philosophy, and science.",
    cta: "Apply Now",
    ctaSection: "Start Your Application",
    bgClass: "landing-page-six-degrees",
    is6Degrees: true,
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

  // Map clean URLs to userTypes
  const pathToUserType = {
    '/six-degrees': 'sixDegrees',
    '/for-professionals': 'professional',
    '/for-high-schoolers': 'highschooler',
    '/for-college-students': 'alumni',
  };

  const userTypeFromPath = pathToUserType[location.pathname];
  const userType = userTypeFromPath || (USER_TYPES[userTypeParam] ? userTypeParam : "highschooler");
  const content = USER_TYPES[userType];

  // Ref for the features section
  const featuresRef = useRef(null);

  // Auto-scroll to features section when navigating to user type routes
  useEffect(() => {
    const shouldScroll = ['/for-professionals', '/for-high-schoolers', '/for-college-students'].includes(location.pathname);

    if (shouldScroll && featuresRef.current) {
      // Small delay to ensure the page has loaded
      setTimeout(() => {
        featuresRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [location.pathname]);

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
                  {content.is6Degrees ? (
                    <>
                      {content.heroTitle}
                    </>
                  ) : (
                    <>
                      Empowering Student
                      <span className="modern-hero-gradient"> Excellence</span>
                    </>
                  )}
                </h1>

                <p className="modern-hero-subtitle">
                  {content.is6Degrees ? content.subheader : `Launching ${schoolConfig.schoolShortName} youth into collegiate and professional success through meaningful connections and real opportunities.`}
                </p>

                <div className="modern-hero-buttons">
                  <button className="modern-hero-btn-primary" onClick={() => handleJoin("Signup")}>
                    <span>{content.is6Degrees ? content.cta : "Join the Network"}</span>
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
        <section ref={featuresRef} className="modern-features">
          <div className="modern-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="modern-section-header"
            >
              <h2 className="modern-section-title">{content.is6Degrees ? "What is Launchpad's 6 Degrees Program?" : "Why Choose Launchpad?"}</h2>
              <p className="modern-section-subtitle">
                {content.is6Degrees ? "A FREE, application-based program connecting exceptional high school students with incredible mentors" : "Everything you need to build your future, all in one platform"}
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

        {/* 6 Degrees Specific Content */}
        {content.is6Degrees && (
          <>
            {/* Mentors Section */}
            <section className="six-degrees-mentors">
              <div className="modern-container">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="modern-section-header"
                >
                  <h2 className="modern-section-title">Meet Your Potential Mentors</h2>
                  <p className="modern-section-subtitle">
                    We're starting with a small pilot group. Our list of potential mentors includes:
                  </p>
                </motion.div>

                <div className="mentors-grid">
                  {[
                    {
                      name: "Charles Calomiris",
                      title: "Columbia Business School Economist",
                      description: "One of the world's leading scholars on financial crises, banking systems, and economic history."
                    },
                    {
                      name: "Roy Baumeister",
                      title: "Social Psychologist",
                      description: "Best known for foundational work on self-control, free will, identity, and human motivation; one of the most cited psychologists in the world."
                    },
                    {
                      name: "Gary Taubes",
                      title: "Investigative Science Journalist",
                      description: "Bestselling author focused on nutrition science, obesity, and metabolism (Good Calories, Bad Calories, The Case for Keto)."
                    },
                    {
                      name: "Andrew Shtulman",
                      title: "Cognitive Scientist",
                      description: "Occidental College professor specializing in how people learn science and how misconceptions form; widely published in cognitive psychology and education research."
                    },
                    {
                      name: "Michael Moss",
                      title: "Pulitzer Prize–winning Journalist",
                      description: "Bestselling author known for exposing how the food industry engineers products around salt, sugar, and fat to drive consumption (Salt Sugar Fat, Hooked)."
                    }
                  ].map((mentor, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="mentor-card"
                    >
                      <h3 className="mentor-name">{mentor.name}</h3>
                      <h4 className="mentor-title">{mentor.title}</h4>
                      <p className="mentor-description">{mentor.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* How to Apply Section */}
            <section className="six-degrees-how-to">
              <div className="modern-container">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="modern-section-header"
                >
                  <h2 className="modern-section-title">How Do I Take Part?</h2>
                </motion.div>

                <div className="steps-grid">
                  {[
                    {
                      step: 1,
                      title: "Create an Account",
                      description: "Sign up at launchpadnetworks.com"
                    },
                    {
                      step: 2,
                      title: "Navigate to Academics",
                      description: "Go to the 'academics' tab on your dashboard"
                    },
                    {
                      step: 3,
                      title: "Fill Out the Application",
                      description: "Share your background, interests, the type of professor you'd like to connect with, and your mentorship goals"
                    },
                    {
                      step: 4,
                      title: "Wait for Response",
                      description: "You'll receive a response within 1-3 days. If accepted, you'll get next steps via email"
                    }
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.15 }}
                      className="step-card"
                    >
                      <div className="step-number">{step.step}</div>
                      <div className="step-content">
                        <h3 className="step-title">{step.title}</h3>
                        <p className="step-description">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* What Happens After Section */}
            <section className="six-degrees-after">
              <div className="modern-container">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="modern-section-header"
                >
                  <h2 className="modern-section-title">What Happens After I Apply?</h2>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="after-process"
                >
                  <ol className="process-list">
                    <li>We review your application and identify professors and writers who best match your interests, goals, and time commitment</li>
                    <li>You receive an email with a short list of professors and writers we believe would be a strong fit</li>
                    <li>You select your preferred professor(s)</li>
                    <li>We'll send a warm introduction email to your selected mentor</li>
                    <li>You and the professor connect directly to schedule calls and begin your informal mentorship</li>
                  </ol>
                </motion.div>
              </div>
            </section>
          </>
        )}

        {/* Stats Section with Rocket Background */}
        {!content.is6Degrees && (
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
        )}

        {/* Mission Section */}
        {!content.is6Degrees && (
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
        )}

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
              <h2 className="modern-cta-title">{content.is6Degrees ? "Ready to Connect with World-Class Mentors?" : "Ready to Launch Your Future?"}</h2>
              <p className="modern-cta-subtitle">
                {content.is6Degrees
                  ? "Apply now for FREE mentorship from top professors and award-winning writers."
                  : "Join our community of ambitious students, successful alumni, and industry professionals."}
              </p>
              <button className="modern-cta-button" onClick={() => handleJoin("Signup")}>
                <span>{content.is6Degrees ? content.ctaSection : "Get Started Today"}</span>
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