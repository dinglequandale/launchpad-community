import React, { useEffect, useState } from 'react';
import CollegeStudent from './CollegeStudent/CollegeStudent';
import HighSchooler from './HighSchooler/HighSchooler';
import "./onboarding.css"
import Professional from './Professional/Professional';
import Staff from './Staff/Staff';
import { BsBackpack } from 'react-icons/bs';
import { BiBriefcase } from 'react-icons/bi';
import { LuGraduationCap } from 'react-icons/lu';
import ProgressBar from '../../components/Progressbar/ProgressBar';
import Loading from '../../components/LoadingAnimation/Loading';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../../firebase/firebaseConfig';
import { GrOrganization } from 'react-icons/gr';
import UserType from './UserType';
import { useAuth } from '../../contexts/auth/AuthContext';

export default function Onboarding() {
    const [numOfSections, setNumOfSections] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOption, setSelectedOption] = useState(() => localStorage.getItem('userType') || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    let schoolId, schoolDisplayName, userRole;

    // localStorage.clear();
    const user = auth.currentUser;
    const {userLoggedIn} = useAuth();
    const location = useLocation();
    const tempSchoolInfo = location.state ?? JSON.parse(localStorage.getItem("tempSchoolInfo"));

    try{
        schoolId = tempSchoolInfo.schoolId;
        schoolDisplayName = tempSchoolInfo.schoolDisplayName;
        userRole = tempSchoolInfo.userRole;
    }catch{}
    // console.log("SCHOOLIDwewe: ", schoolId, schoolDisplayName);


    useEffect(()=>{
        const setUserToken = async () => {
            const functions = getFunctions();
            const createSchoolClaim = httpsCallable(functions, 'createSchoolClaim');
            
            const result = await createSchoolClaim({ schoolId });
    
            await user.getIdToken(true);
            console.log("USER TOKEN CREATED");
        }
        setUserToken();
        
    },[]);
    
    useEffect(() => {
        setNumOfSections(getNumOfSections());
    }, []);

    const getNumOfSections = () => {
        switch(selectedOption){
            case "High Schooler":
                return 4;
            case "College Student":
                return 3;
            case "Professional":
                return 4;
            case "Staff":
                return 3;
            default:
                return null;
        }
    }

    const handleContinue = () => {
        setCurrentPage(currentPage+1); 
    };

    const handlePrev = () => {
        setCurrentPage(currentPage-1);
    }

    const disabledSubmitStyles = {cursor: "not-allowed", background: "gray"};
    return (<>

        {isSubmitting && <div style={{width: "100vw", height: "100vh", background: "rgb(0,0,0,0.1)", position: "absolute"}}></div>}
        <div className='onboarding-container'>
            <div className='background-blend'></div>
            {!tempSchoolInfo && <Navigate to="/school-signup" replace={true}/>}
            {!userLoggedIn && <Navigate to="/Landing" replace={true}/>}
            <div style={{position: "relative"}}>
            <div className='onboarding-body' >
                {currentPage === 0 && <div style={{position: "absolute", top: "-50px", width: "100vw", textAlign: "center"}}><span style={{fontSize: "30px"}}>Connect with your school’s network of students, parents, and alumni</span></div>}
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
                {/* {
                currentPage === 0 ? (
                    <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <UserType 
                            setSelectedOption={(val) => { setSelectedOption(val); localStorage.setItem('userType', val); }}
                            selectedOption={selectedOption}
                            agreedToTerms={agreedToTerms}
                            setAgreedToTerms={setAgreedToTerms}
                            location={location}
                        />
                    </div>
                ) : ( */}
                    <>
                        {selectedOption === "High Schooler" && <HighSchooler schoolInfo={tempSchoolInfo} currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                        {selectedOption === "College Student" && <CollegeStudent schoolInfo={tempSchoolInfo} currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                        {selectedOption === "Professional" && <Professional schoolInfo={tempSchoolInfo} currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                        {userRole === "admin" && <Staff schoolInfo={tempSchoolInfo} currentPage={currentPage} isSubmitting={isSubmitting} setCanSubmit={setCanSubmit}/>}
                    </>
                {/* )}     */}
                </main>
                <footer style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                    <button style={{visibility: `${currentPage < 2 ? "hidden" : "visible"}`}} className="btnUnfilled prevButton" onClick={handlePrev}>
                        Previous
                    </button>
                    {(currentPage !== numOfSections || numOfSections === 0) ? 
                    <button className="continueButton" onClick={handleContinue}>
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