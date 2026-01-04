import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Academics.css";
import SideNav from "../../components/Sidenav/SideNav";
import TopBar from "../../components/Topbar/TopBar";
import { PiArrowRight, PiGraduationCap } from "react-icons/pi";

const mentors = [
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
];

export default function Academics() {
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Listen for sidebar state changes
    useEffect(() => {
        const handleSidebarToggle = (event) => {
            const isCollapsed = event.detail.isCollapsed;
            setIsSidebarCollapsed(isCollapsed);
        };

        // Initial check - get current state from DOM
        const sidebar = document.querySelector('.v0-sidebar');
        if (sidebar) {
            const isCollapsed = sidebar.classList.contains('v0-sidebar-collapsed');
            setIsSidebarCollapsed(isCollapsed);
        }

        // Listen for custom sidebar toggle events
        window.addEventListener('sidebarToggle', handleSidebarToggle);

        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle);
        };
    }, []);

    const handleApplyClick = () => {
        navigate('/6-degree-application');
    };

    return (
        <>
            <TopBar isSidebarCollapsed={isSidebarCollapsed} />
            <SideNav />
            <div className={`academicsContainer ${isSidebarCollapsed ? 'academics-sidebar-collapsed' : 'academics-sidebar-expanded'}`}>

                {/* Hero Section */}
                <div className="academics-hero">
                    <div className="academics-hero-icon">
                        <PiGraduationCap size={48} />
                    </div>
                    <h1 className="academics-hero-title">Launchpad 6 Degrees</h1>
                    <p className="academics-hero-subtitle">
                        Connect with top university professors and award-winning writers. Receive FREE mentorship from experts in economics, psychology, philosophy, and science.
                    </p>
                    <button className="academics-apply-btn" onClick={handleApplyClick}>
                        <span>Apply Now</span>
                        <PiArrowRight className="academics-btn-icon" />
                    </button>
                </div>

                {/* What Happens After Section */}
                <div className="academics-section">
                    <h2 className="academics-section-title">What Happens After I Apply?</h2>
                    <div className="academics-process">
                        <ol className="academics-process-list">
                            <li>We review your application and identify professors and writers who best match your interests, goals, and time commitment</li>
                            <li>You receive an email with a short list of professors and writers we believe would be a strong fit</li>
                            <li>You select your preferred professor(s)</li>
                            <li>We'll send a warm introduction email to your selected mentor</li>
                            <li>You and the professor connect directly to schedule calls and begin your informal mentorship</li>
                        </ol>
                    </div>
                </div>

                {/* Mentors Section */}
                <div className="academics-section">
                    <h2 className="academics-section-title">Meet Your Potential Mentors</h2>
                    <p className="academics-section-subtitle">
                        We're starting with a small pilot group. Our list of potential mentors includes:
                    </p>
                    <div className="academics-mentors-grid">
                        {mentors.map((mentor, idx) => (
                            <div key={idx} className="academics-mentor-card">
                                <h3 className="academics-mentor-name">{mentor.name}</h3>
                                <h4 className="academics-mentor-title">{mentor.title}</h4>
                                <p className="academics-mentor-description">{mentor.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="academics-cta">
                    <h2 className="academics-cta-title">Ready to Connect with World-Class Mentors?</h2>
                    <p className="academics-cta-subtitle">
                        Apply now for FREE mentorship from top professors and award-winning writers.
                    </p>
                    <button className="academics-apply-btn academics-apply-btn-large" onClick={handleApplyClick}>
                        <span>Start Your Application</span>
                        <PiArrowRight className="academics-btn-icon" />
                    </button>
                </div>
            </div>
        </>
    );
}
