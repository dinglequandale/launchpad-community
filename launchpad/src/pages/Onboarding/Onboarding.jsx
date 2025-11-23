import React, { useEffect, useState } from 'react';
import CollegeStudent from './CollegeStudent/CollegeStudent';
import HighSchooler from './HighSchooler/HighSchooler';
import "./Onboarding.css"
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
import { saveHighSchooler, saveCollegeStudent, saveProfessional, saveStaff } from '../../services/onboardingServices';

export default function Onboarding() {
    const [numOfSections, setNumOfSections] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOption, setSelectedOption] = useState(() => localStorage.getItem('userType') || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [userData, setUserData] = useState({});

    const user = auth.currentUser;
    const {userLoggedIn} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // COMMUNITY VERSION: Removed school validation and custom claims setup
    
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

    const handleSubmit = async () => {
        if (!canSubmit) return;
        
        setIsSubmitting(true);
        
        try {
            // Get the user data from the appropriate component
            // COMMUNITY VERSION: Removed schoolId, keep userType as-is (no Alumni conversion)
            const currentUserData = {
                ...userData,
                userType: selectedOption
            };

            // Call the appropriate save function based on user type
            switch (selectedOption) {
                case "High Schooler":
                    await saveHighSchooler(user, currentUserData, () => {
                        navigate('/Home');
                    });
                    break;
                case "College Student":
                    await saveCollegeStudent(user, currentUserData, () => {
                        navigate('/Home');
                    });
                    break;
                case "Professional":
                    await saveProfessional(user, currentUserData, () => {
                        navigate('/Home');
                    });
                    break;
                case "Staff":
                    await saveStaff(user, currentUserData, () => {
                        navigate('/Home');
                    });
                    break;
                default:
                    throw new Error('Invalid user type');
            }
        } catch (error) {
            console.error('Error saving user data:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className='onboarding-container'>
                <div className='background-blend'></div>
                {/* COMMUNITY VERSION: Removed school signup redirect */}
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
                                    src="/assets/launchpad_logo_v2.png" 
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
                                    currentPage={currentPage}
                                    isSubmitting={isSubmitting}
                                    setCanSubmit={setCanSubmit}
                                    setUserData={setUserData}
                                />
                            )}
                            {selectedOption === "College Student" && (
                                <CollegeStudent
                                    currentPage={currentPage}
                                    isSubmitting={isSubmitting}
                                    setCanSubmit={setCanSubmit}
                                    setUserData={setUserData}
                                />
                            )}
                            {selectedOption === "Professional" && (
                                <Professional
                                    currentPage={currentPage}
                                    isSubmitting={isSubmitting}
                                    setCanSubmit={setCanSubmit}
                                    setUserData={setUserData}
                                />
                            )}
                            {/* COMMUNITY VERSION: Commented out admin staff onboarding */}
                            {/* {userRole === "admin" && (
                                <Staff
                                    schoolInfo={tempSchoolInfo}
                                    currentPage={currentPage}
                                    isSubmitting={isSubmitting}
                                    setCanSubmit={setCanSubmit}
                                    setUserData={setUserData}
                                />
                            )} */}
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
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !canSubmit}
                                >
                                    {!isSubmitting ? "Submit" : (
                                        <>
                                            <Loading />
                                            {/* <span style={{ marginLeft: '8px' }}>Saving...</span> */}
                                        </>
                                    )}
                                </button>
                            )}
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}