import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./landingpage.css";
import { useAuth } from "../../contexts/auth/AuthContext";
import { PiBuilding, PiGraduationCap, PiStudent, PiSuitcase } from "react-icons/pi";
import Landing_Nav from "./Landing_Nav/Landing_Nav";
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import { getFunctions, httpsCallable } from "firebase/functions";

const USER_TYPES = {
  highschooler: {
    featureCards: [
      {
        title: "Make Invaluable Connections",
        text: (
          <>
            <span className="highlight">Connect</span> with industry professionals, undergraduates at your dream school, and like-minded peers— all committed to helping you. With just one click, you gain access to a world of opportunities.
          </>
        ),
      },
      {
        title: "Discover Meaningful Opportunities",
        text: (
          <>
            <span className="highlight">Find</span> volunteer and leadership positions in town, in line with your interests. Discover workplace opportunities while learning from undergrads and professionals who have done what you want to do!
          </>
        ),
      },
      {
        title: "Explore Careers & Colleges",
        text: (
          <>
            <span className="highlight">Complete</span> reputed surveys to find the careers that best suit you. Connect with undergrads and professionals in your fields of interest to gain insight on college and work life. Explore shadow, intern, and job opportunities.
          </>
        ),
      },
    ],
    heroTitle: (
      <>
        <span style={{ color: "var(--neutral)", textDecoration: "underline" }}>Empowerin</span>
        <span style={{ color: "var(--neutral)" }}>g</span> Student Excellence
      </>
    ),
    subheader: (
      <>
        <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>Launching</span> Awty's youth into <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>collegiate</span> and <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>professional</span> success
      </>
    ),
    cta: "Get Started",
    ctaSection: "Sign Up Now",
    bgClass: "landing-page",
  },
  alumni: {
    featureCards: [
      {
        title: "Explore Careers & Opportunities",
        text: (
          <>
            <span className="highlight">Connect</span> with professionals in your fields of interest to gain insights on work life and explore intern/job opportunities! Talk with other skilled undergrads. Complete reputed surveys to find the careers that best suit you.
          </>
        ),
      },
      {
        title: "Discover Meaningful Opportunities",
        text: (
          <>
            Many students seek to <span className="highlight">follow in your footsteps</span> and attend the same colleges. Share your experiences, offer advice, and <span className="highlight">help guide Awty's next generation</span>!
          </>
        ),
      },
      {
        title: "Promote Your Initiatives",
        text: (
          <>
            <span className="highlight">Have a growing business?</span> A budding project? Promote your initiative to professionals. Looking for help? Accelerate your project by connecting with talented undergraduates and high schoolers!
          </>
        ),
      },
    ],
    heroTitle: (
      <>
        <span style={{ color: "var(--neutral)", textDecoration: "underline" }}>Empowerin</span>
        <span style={{ color: "var(--neutral)" }}>g</span> Student Excellence
      </>
    ),
    subheader: (
      <>
        <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>Launching</span> Awty's youth into <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>collegiate</span> and <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>professional</span> success
      </>
    ),
    cta: "Get Started",
    ctaSection: "Sign Up Now",
    bgClass: "landing-page-alumni",
  },
  professional: {
    featureCards: [
      {
        title: "Guide the Next Generation",
        text: (
          <>
            Our platform hosts an exceptional youth studying at Awty and <span className="highlight">top U.S colleges</span> (Princeton, Carnegie Mellon, etc ...), all eager to excel. By joining Launchpad, you are empowered to <span className="highlight">shape their future</span> by offering insights, advice, and workplace opportunities.
          </>
        ),
      },
      {
        title: "Expand Your Professional Network",
        text: (
          <>
            As a professional, you are certainly <span className="highlight">not limited</span> to networking with students. Indeed, Launchpad equips users with <span className="highlight">powerful search filters</span> to seamlessly connect with other professionals in the Awty community!
          </>
        ),
      },
      {
        title: "Promote Opportunities",
        text: (
          <>
            Have any <span className="highlight">internship positions</span> open? <span className="highlight">Looking for volunteers</span> for a certain project? Open to job applications? <span className="highlight">Promote your listings</span> to qualified undergraduates and/or motivated highschoolers!
          </>
        ),
      },
    ],
    heroTitle: (
      <>
        <span style={{ color: "var(--neutral)", textDecoration: "underline" }}>Empowerin</span>
        <span style={{ color: "var(--neutral)" }}>g</span> Student Excellence
      </>
    ),
    subheader: (
      <>
        <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>Launching</span> Awty's youth into <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>collegiate</span> and <span style={{ fontWeight: "bolder", color: "var(--neutral)", textDecoration: "underline" }}>professional</span> success
      </>
    ),
    cta: "Get Started",
    ctaSection: "Sign Up Now",
    bgClass: "landing-page-professional",
  },
};

const WHO_ARE_WE = (
  <>
    <span style={{ fontWeight: "bolder" }}>Launchpad</span> is a <span className="highlight">free local social network</span> designed to empower Awty's youth by creating meaningful connections among:
  </>
);

const NETWORK_GRID = [
  { icon: <PiStudent />, label: "Motivated highschoolers" },
  { icon: <PiGraduationCap />, label: "Qualified undergraduates" },
  { icon: <PiSuitcase />, label: "Experienced professionals" },
  { icon: <PiBuilding />, label: "Community organizations" },
];

const MISSION = (
  <>
    <span className="highlight">We act as a launchpad</span> for high school students' potential and passion, propelling them into college and beyond. By fostering a vibrant network of mentors, professionals, alumni, and high quality resources, we empower our youth to strengthen their portfolio of work experience and extracurriculars.
  </>
);

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
  const userType = USER_TYPES[userTypeParam] ? userTypeParam : "highschooler";
  const content = USER_TYPES[userType];

  const handleJoin = () => {
    if (!userLoggedIn) {
      navigate("/Login");
    } else {
      navigate("/Home");
    }
  };

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
                <button className="authButtons btnUnfilled" onClick={() => navigate("/Signup")}>Signup</button>
                <button className="authButtons" onClick={() => navigate("/Login")}>Login</button>
              </div>
            </div>
          </nav>
          <div style={{ paddingTop: "30px" }}>
            <h1 className="landing-title">{content.heroTitle}</h1>
          </div>
          <p className="subheader">{content.subheader}</p>
          <button className="cta-button btnUnfilled" onClick={handleJoin}>{content.cta}</button>
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
                <p className="description">{WHO_ARE_WE}</p>
                <div className="network-grid">
                  {NETWORK_GRID.map((item, idx) => (
                    <div className="network-item" key={idx}>
                      <i>{item.icon}</i>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="description goal">
                  Our aim is to provide Awty's youth with <span className="highlight">accessible learning, leadership, and workplace opportunities</span>.
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
            <div className="mission-container">
              <p className="mission-text">{MISSION}</p>
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
            <button className="cta-button btnUnfilled" onClick={handleJoin}>{content.ctaSection}</button>
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