import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BsBackpack } from 'react-icons/bs';
import { BiBriefcase } from 'react-icons/bi';
import { LuGraduationCap } from 'react-icons/lu';
import { GrOrganization } from 'react-icons/gr';

export default function UserType() {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState(() => localStorage.getItem('userType') || '');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const userTypes = [
        { id: 'highschool', label: 'High Schooler', icon: <BsBackpack size={25}/> },
        { id: 'college', label: 'College Student', icon: <LuGraduationCap size={30}/> },
        { id: 'professional', label: 'Professional', icon: <BiBriefcase size={25}/> },
        // { id: 'staff', label: 'Staff', icon: <GrOrganization size={25}/> },
    ];

    const handleUserTypeSelection = (userType) => {
        setSelectedOption(userType);
    };

    const handleContinue = () => {
        localStorage.setItem('userType', selectedOption);
        navigate("/Signup", {state: selectedOption});
    };

    // If tempSchoolInfo is not present, redirect to school-signup
    if (!localStorage.getItem('tempSchoolInfo')) {
        return <Navigate to="/school-signup" replace={true}/>;
    }

    return (
        <div className='onboarding-container'>
            <div className='background-blend'></div>
            <div className="onboarding-wrapper">
                <div className='onboarding-body'>
                    <header className="onboarding-header">
                        <div className="onboarding-logo-container">
                            <img 
                                src="/assets/launchpad_logo.png" 
                                alt="Launchpad Logo" 
                                className="onboarding-logo"
                            />
                        </div>
                    </header>
                    
                    <main className="onboarding-main">
                        <div className="form-section">
                            <h2 className="page-title">Create your Account</h2>
                            <p className="form-subtitle">Which best describes you?</p>
                            
                            <div className="userType-options-container">
                                {userTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        className={`userType-option ${selectedOption === type.label ? 'selected' : ''}`}
                                        onClick={() => handleUserTypeSelection(type.label)}
                                    >
                                        <div className="userType-icon">
                                            {type.icon}
                                        </div>
                                        <span className="userType-label">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="terms-checkbox-container">
                                <label className="terms-checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={agreedToTerms} 
                                        onChange={() => setAgreedToTerms(!agreedToTerms)}
                                        className="terms-checkbox"
                                    />
                                    <span className="terms-text">
                                        I accept the{' '}
                                        <a 
                                            onClick={() => navigate("/privacy", {state: "/onboarding"})}
                                            className="terms-link"
                                        >
                                            Privacy Policy
                                        </a>
                                        {' '}and the{' '}
                                        <a 
                                            onClick={() => navigate("/terms", {state: "/onboarding"})}
                                            className="terms-link"
                                        >
                                            Terms and Conditions
                                        </a>
                                        .
                                    </span>
                                </label>
                            </div>
                        </div>
                    </main>
                    
                    <footer className="onboarding-footer">
                        <div></div>
                        <button
                            className={`continueButton ${(!selectedOption || !agreedToTerms) ? 'disabled' : ''}`}
                            onClick={handleContinue}
                            disabled={!selectedOption || !agreedToTerms}
                        >
                            Continue
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
} 