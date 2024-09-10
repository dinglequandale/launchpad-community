import React, { useState } from 'react';
import OnboardingDropdown from '../../components/OnboardingDropdown/OnboardingDropdown';
import CollegeStudent from './CollegeStudent/CollegeStudent';
import HighSchooler from './HighSchooler/HighSchooler';
import "./onboarding.css"
import Professional from './Professional/Professional';
import { BsBackpack } from 'react-icons/bs';
import { BiBriefcase } from 'react-icons/bi';
import { LuGraduationCap } from 'react-icons/lu';
import ProgressBar from '../../components/Progressbar/ProgressBar';

export default function Onboarding() {
    const [showComponent, setShowComponent] = useState(false);
    const [numOfSections, setNumOfSections] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const getNumOfSections = () => {
        switch(selectedOption){
            case "High Schooler":
                return 3;
            case "College Student":
                return 3;
            case "Professional":
                return 5;
            default:
                return null;
        }
    }

    const handleContinue = () => {
        if(!showComponent){
            setShowComponent(true);
            setNumOfSections(getNumOfSections());
            console.log(numOfSections);
        }
        setCurrentPage(currentPage+1); 
    };

    const handlePrev = () => {
        if(currentPage === 1){
            setShowComponent(false);
        }
        setCurrentPage(currentPage-1);
    }

    const disabledSubmitStyles = {cursor: "not-allowed", background: "gray"};
    return (
        <div className='onboarding-container'>
            <div className='onboarding-body'>
            <header style={{marginBottom: "2rem"}}>
                <div style={{background: "var(--accent)", borderRadius: "25px", boxShadow: "var(--shadowColor)",
                    display: "flex", justifyContent: "center", alignItems: "center", height: "100px",  marginBottom: "20px"}}>
                    <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "100%"}}/>
                </div>
                {(currentPage !== 0) && <ProgressBar
                    numOfSections={numOfSections}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    showArrows={false}
                />}
            </header>
            <main style={{marginBottom: "2rem"}}>
            {!showComponent ? (
                <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                    <UserType setSelectedOption={setSelectedOption} selectedOption={selectedOption}/>
                    <div style={{display: "flex", marginTop: "15px"}}>
                        <input type="checkbox" checked={agreedToTerms} onChange={()=>setAgreedToTerms(!agreedToTerms)}/>
                        <span>I accept the <a href="/" style={{textDecoration: "underline"}}>Privacy Policy</a> and the <a href="" style={{textDecoration: "underline"}}>Terms and Conditions</a>.</span>
                    </div>
                </div>
            ) : (
                <>
                    {selectedOption === "High Schooler" && <HighSchooler currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                    {selectedOption === "College Student" && <CollegeStudent currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                    {selectedOption === "Professional" && <Professional currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                </>
            )}    
            </main>
            <footer style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                <button style={{visibility: `${currentPage === 0 ? "hidden" : "visible"}`}} className="btnUnfilled continueButton" onClick={handlePrev}>
                    Previous
                </button>
                {(currentPage !== numOfSections || numOfSections === 0) ? 
                <button className="continueButton" onClick={handleContinue} disabled={!selectedOption || !agreedToTerms}>
                Continue
                </button>
                : 
                <button onClick={()=>{if(canSubmit){
                    setIsSubmitting(true);
                }}} className='continueButton' style={!canSubmit ? disabledSubmitStyles : {}}>
                    Submit
                </button>}
            </footer>
            </div>
        </div>
    );
};

function UserType({setSelectedOption, selectedOption}) {
    const userTypes = [
        { id: 'highschool', label: 'High Schooler', icon: <BsBackpack size={25}/> },
        { id: 'college', label: 'College Student', icon: <LuGraduationCap size={30}/> },
        { id: 'professional', label: 'Professional', icon: <BiBriefcase size={25}/> },
      ];

    const handleUserTypeSelection = (userType) => {
        setSelectedOption(userType);
    }
    
    return(
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
        </div>
    )    
}