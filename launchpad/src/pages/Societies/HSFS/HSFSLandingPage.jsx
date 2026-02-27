import React, { useState, useEffect, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "../../landing_page/LandingPage.css";
import "./HSFSLandingPage.css";
import { useAuth } from "../../../contexts/auth/AuthContext";
import { useSociety } from "../../../contexts/SocietyContext";
import { HSFS_LANDING_CONTENT } from "../../../utils/hsfsConstants";
import { PiUsers, PiLightbulb, PiRocket, PiArrowRight, PiTrendUp, PiStudent, PiSuitcase, PiBuilding } from "react-icons/pi";
import LegalityFooter from "../../../components/Legality Footer/LegalityFooter";
import { motion } from "framer-motion";

export default function HSFSLandingPage() {
  const { userLoggedIn } = useAuth();
  const { setSociety } = useSociety();
  const navigate = useNavigate();
  const location = useLocation();
  const content = HSFS_LANDING_CONTENT;

  // Determine which subtab is active
  const pathToTab = {
    '/hsfs/for-professionals': 'professional',
    '/hsfs/for-high-schoolers': 'highschooler',
  };
  const [activeTab, setActiveTab] = useState(pathToTab[location.pathname] || 'highschooler');

  const featuresRef = useRef(null);

  useEffect(() => {
    const tab = pathToTab[location.pathname];
    if (tab) {
      setActiveTab(tab);
      if (featuresRef.current) {
        setTimeout(() => {
          featuresRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.pathname]);

  const handleGetStarted = () => {
    setSociety('hsfs');
    navigate("/hsfs-access");
  };

  const handleLogin = () => {
    setSociety('hsfs');
    navigate("/Login");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'professional') {
      navigate('/hsfs/for-professionals');
    } else {
      navigate('/hsfs/for-high-schoolers');
    }
    setTimeout(() => {
      featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const currentTabContent = activeTab === 'professional' ? content.professionalTab : content.highSchoolerTab;

  return (
    <>
      {userLoggedIn && <Navigate to="/Home" replace={true} />}
      <div className="modern-landing hsfs-landing">
        {/* Navbar */}
        <nav className="modern-navbar">
          <div className="modern-navbar-container">
            <img src="/assets/launchpad_logo.png" alt="HSFS Logo" className="modern-logo" />
            <div className="hsfs-subtabs">
              <button
                className={`hsfs-subtab ${activeTab === 'highschooler' ? 'active' : ''}`}
                onClick={() => handleTabChange('highschooler')}
              >
                For HSFS Members
              </button>
              <button
                className={`hsfs-subtab ${activeTab === 'professional' ? 'active' : ''}`}
                onClick={() => handleTabChange('professional')}
              >
                For Professionals
              </button>
            </div>
            <div className="modern-auth-buttons">
              <button className="modern-btn modern-btn-outline" onClick={handleLogin}>
                Login
              </button>
              <button className="modern-btn modern-btn-primary" onClick={handleGetStarted}>
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="modern-hero">
          <div className="modern-hero-container">
            <div className="modern-hero-grid">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
                className="modern-hero-content"
              >
                <h1 className="modern-hero-title">
                  {content.heroTitle.split("Finance").map((part, i) =>
                    i === 0 ? (
                      <React.Fragment key={i}>
                        {part}
                        <span className="modern-hero-gradient">Finance</span>
                      </React.Fragment>
                    ) : part
                  )}
                </h1>

                <p className="modern-hero-subtitle">
                  {content.heroDescription}
                </p>

                <div className="modern-hero-buttons">
                  <button className="modern-hero-btn-primary" onClick={handleGetStarted}>
                    <span>{content.heroCTA}</span>
                    <PiArrowRight className="modern-btn-icon" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.645, 0.045, 0.355, 1] }}
                className="modern-hero-image-container"
              >
                <div className="modern-hero-image-wrapper">
                  <img
                    src="/assets/earth_connect_landing.jpg"
                    alt="Finance Network"
                    className="modern-hero-image"
                  />
                  <div className="modern-hero-image-glow"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose HSFS Section */}
        <section className="modern-features">
          <div className="modern-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="modern-section-header"
            >
              <h2 className="modern-section-title">{content.whyChooseTitle}</h2>
              <p className="modern-section-subtitle">{content.whyChooseSubtitle}</p>
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

        {/* Empowering Student Leaders / Network Grid */}
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
              {content.empoweringTitle}
            </motion.h2>

            <div className="modern-stats-grid">
              {content.networkGrid.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="modern-stat-card"
                >
                  <div className="modern-stat-icon">
                    {idx === 0 && <PiStudent />}
                    {idx === 1 && <PiSuitcase />}
                    {idx === 2 && <PiBuilding />}
                  </div>
                  <p className="modern-stat-label">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Subtabs: For Professionals / For High Schoolers */}
        <section ref={featuresRef} className="modern-features">
          <div className="modern-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="modern-section-header"
            >
              <h2 className="modern-section-title">{currentTabContent.title}</h2>
            </motion.div>

            <div className="modern-features-grid">
              {currentTabContent.cards.map((card, idx) => (
                <motion.div
                  key={`${activeTab}-${idx}`}
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
              <h2 className="modern-mission-title">{content.missionTitle}</h2>
              <p className="modern-mission-text">{content.missionText}</p>
              <div className="modern-mission-highlight">
                <PiTrendUp className="modern-mission-icon" />
                <p><strong>{content.visionTitle}:</strong> {content.visionText}</p>
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
              <h2 className="modern-cta-title">{content.ctaTitle}</h2>
              <p className="modern-cta-subtitle">{content.ctaDescription}</p>

              <div className="hsfs-access-section">
                <p style={{ marginBottom: '12px', fontWeight: '500' }}>
                  {content.ctaAccessCodeText}
                </p>
                <p style={{ fontSize: '0.85rem' }}>
                  {content.ctaAccessCodeHelp.split('houstonstudentfinancesociety@gmail.com').map((part, i) =>
                    i === 0 ? (
                      <React.Fragment key={i}>
                        {part}
                        <a href="mailto:houstonstudentfinancesociety@gmail.com">
                          houstonstudentfinancesociety@gmail.com
                        </a>
                      </React.Fragment>
                    ) : part
                  )}
                </p>
              </div>

              <button className="modern-cta-button" onClick={handleGetStarted} style={{ marginTop: '1.5rem' }}>
                <span>Get Started</span>
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
