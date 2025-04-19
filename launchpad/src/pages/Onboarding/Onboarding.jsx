import React, { useState } from 'react';
import CollegeStudent from './CollegeStudent/CollegeStudent';
import HighSchooler from './HighSchooler/HighSchooler';
import "./onboarding.css"
import Professional from './Professional/Professional';
import { BsBackpack } from 'react-icons/bs';
import { BiBriefcase } from 'react-icons/bi';
import { LuGraduationCap } from 'react-icons/lu';
import ProgressBar from '../../components/Progressbar/ProgressBar';
import Loading from '../../components/LoadingAnimation/Loading';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../../firebase/firebaseConfig';

export default function Onboarding() {
    const [showComponent, setShowComponent] = useState(false);
    const [numOfSections, setNumOfSections] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    let schoolId, schoolDisplayName;

    // localStorage.clear();
    const user = auth.currentUser;
    const location = useLocation();
    const tempSchoolInfo = location.state ?? JSON.parse(localStorage.getItem("tempSchoolInfo"));

    try{
        schoolId = tempSchoolInfo.schoolId;
        schoolDisplayName = tempSchoolInfo.schoolDisplayName;
    }catch{}
    // console.log("SCHOOLIDwewe: ", schoolId, schoolDisplayName);


    useState(()=>{
        const setUserToken = async () => {
            const functions = getFunctions();
            const createSchoolClaim = httpsCallable(functions, 'createSchoolClaim');
            
            const result = await createSchoolClaim({ schoolId });
    
            await user.getIdToken(true);
            console.log("USER TOKEN CREATED");
        }
        setUserToken();
        
    },[]);

    const getNumOfSections = () => {
        switch(selectedOption){
            case "High Schooler":
                return 3;
            case "College Student":
                return 3;
            case "Professional":
                return 4;
            default:
                return null;
        }
    }

    const handleContinue = () => {
        if(!showComponent){
            setShowComponent(true);
            setNumOfSections(getNumOfSections());
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
    return (<>
        {isSubmitting && <div style={{width: "100vw", height: "100vh", background: "rgb(0,0,0,0.1)", position: "absolute"}}></div>}
        <div className='onboarding-container'>
            <div className='background-blend'></div>
            {!tempSchoolInfo && <Navigate to="/school-signup" replace={true}/>}
            <div style={{position: "relative"}}>
            <div className='onboarding-body' >
                {!showComponent && <div style={{position: "absolute", top: "-50px", width: "100vw", textAlign: "center"}}><span style={{fontSize: "30px"}}>Connect with your school’s network of students, parents, and alumni</span></div>}
                <header style={{marginBottom: "1.5rem", position: "relative"}}>
                
                    <div style={{background: "var(--accent)", borderRadius: "25px",
                        display: "flex", justifyContent: "center", alignItems: "center", height: "80px", padding: "10px 5px",  marginBottom: "5px"}}>
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
                        <UserType setSelectedOption={setSelectedOption} selectedOption={selectedOption} agreedToTerms={agreedToTerms} setAgreedToTerms={setAgreedToTerms} location={location}/>
                    </div>
                ) : (
                    <>
                        {selectedOption === "High Schooler" && <HighSchooler schoolInfo={tempSchoolInfo} currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                        {selectedOption === "College Student" && <CollegeStudent schoolInfo={tempSchoolInfo} currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                        {selectedOption === "Professional" && <Professional schoolInfo={tempSchoolInfo} currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                    </>
                )}    
                </main>
                <footer style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                    <button style={{visibility: `${currentPage === 0 ? "hidden" : "visible"}`}} className="btnUnfilled prevButton" onClick={handlePrev}>
                        Previous
                    </button>
                    {(currentPage !== numOfSections || numOfSections === 0) ? 
                    <button className="continueButton" onClick={handleContinue} disabled={!selectedOption || !agreedToTerms}>
                    Continue
                    </button>
                    : 
                    <button onClick={()=>{if(canSubmit){
                        setIsSubmitting(true);
                    }}} className='continueButton' disabled={isSubmitting} style={!canSubmit ? disabledSubmitStyles : {}}>
                        {!isSubmitting ? "Submit" : <Loading style={{maxWidth: "4px"}}/>}
                    </button>}
                </footer>
            </div>
            </div>
        </div>
    </>);
};

function UserType({setSelectedOption, selectedOption, setAgreedToTerms, agreedToTerms, location}) {

    const navigate = useNavigate();

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
            <div style={{display: "flex", marginTop: "15px"}}>
                <input type="checkbox" checked={agreedToTerms} onChange={()=>setAgreedToTerms(!agreedToTerms)}/>
                <span>I accept the <a onClick={() => {
                    navigate("/privacy", {state: location.pathname});
                }} style={{textDecoration: "underline"}}>Privacy Policy</a> and the <a onClick={() => {
                    navigate("/terms", {state: location.pathname});
                }} style={{textDecoration: "underline"}}>Terms and Conditions</a>.</span>
            </div>
        </div>
    )    
}