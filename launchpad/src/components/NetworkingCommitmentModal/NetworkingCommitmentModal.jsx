import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { editUserData } from "../../services/userProfileServices";
import { useAuth } from "../../contexts/auth/AuthContext";
import "./NetworkingCommitmentModal.css";

export default function NetworkingCommitmentModal({ onClose, userData }) {
    const [selectedOptions, setSelectedOptions] = useState(userData?.networkingLevel || []);
    const { currentUser } = useAuth();

    const handleOptionChange = (event) => {
        const value = event.target.value;
        setSelectedOptions(prevOptions =>
            prevOptions.includes(value)
                ? prevOptions.filter(option => option !== value)
                : [...prevOptions, value]
        );
    };

    const handleSave = async () => {
        await editUserData({
            networkingLevel: selectedOptions,
            hasSeenNetworkingCommitmentPopup: true
        }, currentUser, userData);
        onClose();
    };

    const handleSkip = async () => {
        // Mark as seen even if skipped
        await editUserData({
            hasSeenNetworkingCommitmentPopup: true
        }, currentUser, userData);
        onClose();
    };

    const availabilityOptionsConfig = [
        {
            id: "casualConnection",
            text: "Answer occasional questions from students regarding your career fields",
            value: "Casual Connection",
        },
        {
            id: "generalInquiries",
            text: "Entertain student inquiries about opportunities you know of within your career field",
            value: "General Inquiries",
        },
        {
            id: "informationalInterview",
            text: "Occasionally hold short discussions about your career experiences with students or school clubs",
            value: "Short Interview",
        },
        {
            id: "projectSupport",
            text: "Support certain student businesses, nonprofits, or fundraisers you identify with",
            value: "Project Support",
        },
        {
            id: "mockInterview",
            text: "Conduct mock interviews to help alumni entering similar career fields",
            value: "Mock Interview",
        },
        {
            id: "workplaceOpportunities",
            text: "Offer shadow, internship, job, or volunteer opportunities for students or alumni at your company",
            value: "Workplace Opportunities",
        },
    ];

    return (
        <div className="networking-modal-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="networking-modal-container">
                <div className="networking-modal-header">
                    <button className="networking-modal-close-btn" onClick={handleSkip}>
                        <CgClose size={20} />
                    </button>
                    <h2 className="networking-modal-title">Welcome to Launchpad! 🎉</h2>
                    <p className="networking-modal-subtitle">Help us understand how you'd like to mentor students</p>
                </div>

                <div className="networking-modal-content">
                    <div className="networking-intro">
                        <div className="networking-intro-card">
                            <h3 className="networking-intro-title">Your expertise matters</h3>
                            <p className="networking-intro-text">
                                As a professional on Launchpad, you have the opportunity to make a meaningful impact on students'
                                career journeys. Students and alumni will be able to connect with you based on your commitment level.
                            </p>
                            <p className="networking-intro-text">
                                <strong>Select the types of support you're comfortable providing.</strong> You can always update this later in your profile settings.
                            </p>
                        </div>
                    </div>

                    <div className="networking-options">
                        {availabilityOptionsConfig.map((option) => (
                            <div key={option.id} className="networking-option">
                                <label className="networking-checkbox-label">
                                    <input
                                        type="checkbox"
                                        value={option.value}
                                        checked={selectedOptions.includes(option.value)}
                                        onChange={handleOptionChange}
                                        className="networking-checkbox"
                                    />
                                    <div className="networking-checkbox-content">
                                        <span className="networking-option-title">{option.value}</span>
                                        <span className="networking-option-description">{option.text}</span>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="networking-modal-footer">
                    <button
                        className="networking-btn-secondary"
                        onClick={handleSkip}
                    >
                        Skip for now
                    </button>
                    <button
                        className="networking-btn-primary"
                        onClick={handleSave}
                        disabled={selectedOptions.length === 0}
                    >
                        Save My Commitment
                    </button>
                </div>
            </div>
        </div>
    );
}
