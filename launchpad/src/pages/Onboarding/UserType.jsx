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
    // After continue, reload or navigate to onboarding main flow


    return (
        <div className='onboarding-container'>
            <div className='background-blend'></div>
            <div style={{position: "relative"}}>
                <div className='onboarding-body' >
                    <div style={{background: "var(--accent)", borderRadius: "25px",
                        display: "flex", justifyContent: "center", alignItems: "center", height: "80px", padding: "10px 5px",  marginBottom: "5px"}}>
                        <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "100%"}}/>
                    </div>
                    <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
                        <span style={{fontSize: "30px", fontWeight: "bolder", marginBottom: "5px", color: "var(--secondary)"}}>Create your Account</span>
                        <span style={{marginBottom: "15px", fontSize: "large", color: "secondary"}}>Which best describes you?</span>
                        <div className="userType-options-container">
                            {userTypes.map((type) => (
                                <button
                                    key={type.id}
                                    className={`btnUnfilled userType-option ${selectedOption === type.label ? 'selected' : ''}`}
                                    onClick={() => handleUserTypeSelection(type.label)}
                                >
                                    {type.icon}
                                    <span className="userType-label">{type.label}</span>
                                </button>
                            ))}
                        </div>
                        <div style={{display: "flex", marginTop: "15px"}}>
                            <input type="checkbox" checked={agreedToTerms} onChange={()=>setAgreedToTerms(!agreedToTerms)}/>
                            <span>I accept the <a onClick={() => {
                                navigate("/privacy", {state: "/onboarding"});
                            }} style={{textDecoration: "underline"}}>Privacy Policy</a> and the <a onClick={() => {
                                navigate("/terms", {state: "/onboarding"});
                            }} style={{textDecoration: "underline"}}>Terms and Conditions</a>.</span>
                        </div>
                        <div style={{display: "flex", justifyContent: "right", width: "80%"}}>
                            <button
                                className="continueButton"
                                style={{marginTop: 30}}
                                onClick={handleContinue}
                                disabled={!selectedOption || !agreedToTerms}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 