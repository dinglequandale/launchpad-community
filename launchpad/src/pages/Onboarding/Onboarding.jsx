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

    const user = auth.currentUser;
    const {userLoggedIn} = useAuth();
    const location = useLocation();
    const tempSchoolInfo = location.state ?? JSON.parse(localStorage.getItem("tempSchoolInfo"));

    try{
        schoolId = tempSchoolInfo.schoolId;
        schoolDisplayName = tempSchoolInfo.schoolDisplayName;
        userRole = tempSchoolInfo.userRole;
    }catch{}

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

    return (
        <>
            {isSubmitting && (
                <div className="onboarding-overlay">
                    <div className="onboarding-loading">
                        <Loading />
                    </div>
                </div>
            )}
            
            <div className='onboarding-container'>
                <div className='background-blend'></div>
                {!tempSchoolInfo && <Navigate to="/school-signup" replace={true}/>}
                {!userLoggedIn && <Navigate to="/Landing" replace={true}/>}
                
                <div className="onboarding-wrapper">
                    <div className='onboarding-body'>
                        {currentPage === 0 && (
                            <div className="onboarding-hero">
                                <h1 className="onboarding-hero-title">
                                    Connect with your school's network of students, parents, and alumni
                                </h1>
                            </div>
                        )}
                        
                        <header className="onboarding-header">
                            <div className="onboarding-logo-container">
                                <img 
                                    src="/assets/launchpad_logo.png" 
                                    alt="Launchpad Logo" 
                                    className="onboarding-logo"
                                />
                            </div>
                            
                            {(currentPage !== 0) && (
                                <ProgressBar
                                    numOfSections={numOfSections}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    showArrows={false}
                                />
                            )}
                        </header>
                        
                        <main className="onboarding-main">
                            {selectedOption === "High Schooler" && (
                                <HighSchooler 
                                    schoolInfo={tempSchoolInfo} 
                                    currentPage={currentPage} 
                                    isSubmitting={isSubmitting} 
                                    setCanSubmit={setCanSubmit}
                                />
                            )}
                            {selectedOption === "College Student" && (
                                <CollegeStudent 
                                    schoolInfo={tempSchoolInfo} 
                                    currentPage={currentPage} 
                                    isSubmitting={isSubmitting} 
                                    setCanSubmit={setCanSubmit}
                                />
                            )}
                            {selectedOption === "Professional" && (
                                <Professional 
                                    schoolInfo={tempSchoolInfo} 
                                    currentPage={currentPage} 
                                    isSubmitting={isSubmitting} 
                                    setCanSubmit={setCanSubmit}
                                />
                            )}
                            {userRole === "admin" && (
                                <Staff 
                                    schoolInfo={tempSchoolInfo} 
                                    currentPage={currentPage} 
                                    isSubmitting={isSubmitting} 
                                    setCanSubmit={setCanSubmit}
                                />
                            )}
                        </main>
                        
                        <footer className="onboarding-footer">
                            <button 
                                className={`prevButton ${currentPage < 2 ? 'hidden' : ''}`}
                                onClick={handlePrev}
                            >
                                Previous
                            </button>
                            
                            {(currentPage !== numOfSections || numOfSections === 0) ? (
                                <button 
                                    className="continueButton" 
                                    onClick={handleContinue}
                                >
                                    Continue
                                </button>
                            ) : (
                                <button 
                                    className={`continueButton ${!canSubmit ? 'disabled' : ''}`}
                                    onClick={() => {
                                        if(canSubmit) {
                                            setIsSubmitting(true);
                                        }
                                    }}
                                    disabled={isSubmitting || !canSubmit}
                                >
                                    {!isSubmitting ? "Submit" : <Loading />}
                                </button>
                            )}
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}