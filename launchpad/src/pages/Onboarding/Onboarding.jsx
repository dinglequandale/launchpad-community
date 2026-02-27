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
import PageLoading from '../../components/LoadingAnimation/PageLoading';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../../firebase/firebaseConfig';
import { GrOrganization } from 'react-icons/gr';
import UserType from './UserType';
import { useAuth } from '../../contexts/auth/AuthContext';
import { saveHighSchooler, saveCollegeStudent, saveProfessional, saveStaff } from '../../services/onboardingServices';
import { saveHSFSHighSchooler, saveHSFSProfessional } from '../../services/hsfsOnboardingServices';
import { useSociety } from '../../contexts/SocietyContext';
import { getSocietyConfig } from '../../utils/subdomainUtils';
import HSFSHighSchooler from '../Societies/HSFS/HSFSHighSchooler';
import HSFSProfessional from '../Societies/HSFS/HSFSProfessional';
import toast from 'react-hot-toast';

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
    const { currentSociety } = useSociety();
    const societyConfig = currentSociety ? getSocietyConfig(currentSociety) : null;
    const isHSFS = currentSociety === 'hsfs';
    const location = useLocation();
    const navigate = useNavigate();

    // COMMUNITY VERSION: Removed school validation and custom claims setup

    useEffect(() => {
        setNumOfSections(getNumOfSections());
    }, []);

    const getNumOfSections = () => {
        // HSFS-specific page counts
        if (isHSFS) {
            switch(selectedOption){
                case "High Schooler":
                    return 2;
                case "Professional":
                    return 3;
                default:
                    return null;
            }
        }
        switch(selectedOption){
            case "High Schooler":
                return 4;
            case "College Student":
                return 4;
            case "Professional":
                return 5;
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
        if (!canSubmit) {
            toast.error('Please fill out all required fields before submitting.');
            return;
        }

        setIsSubmitting(true);
        const startTime = Date.now();
        const minLoadingTime = 3000; // 3 seconds minimum

        try {
            // Get the user data from the appropriate component
            // COMMUNITY VERSION: Removed schoolId, keep userType as-is (no Alumni conversion)
            let currentUserData = {
                ...userData,
                userType: selectedOption
            };

            // For HSFS, also merge in localStorage data as a reliable fallback
            // (child components save to localStorage on every change)
            if (isHSFS) {
                const lsKey = selectedOption === "High Schooler"
                    ? 'tempHSFSHighSchoolerInfo'
                    : 'tempHSFSProfessionalInfo';
                try {
                    const savedData = JSON.parse(localStorage.getItem(lsKey) || '{}');
                    currentUserData = { ...savedData, ...userData, userType: selectedOption };
                } catch (e) {
                    console.error('Error reading HSFS temp data from localStorage:', e);
                }
            }

            // Call the appropriate save function based on user type and society
            if (isHSFS) {
                switch (selectedOption) {
                    case "High Schooler":
                        await saveHSFSHighSchooler(user, currentUserData, () => {
                            localStorage.removeItem('tempHSFSHighSchoolerInfo');
                        });
                        break;
                    case "Professional":
                        await saveHSFSProfessional(user, currentUserData, () => {
                            localStorage.removeItem('tempHSFSProfessionalInfo');
                        });
                        break;
                    default:
                        throw new Error('Invalid HSFS user type');
                }
            } else {
                switch (selectedOption) {
                    case "High Schooler":
                        await saveHighSchooler(user, currentUserData, () => {
                            localStorage.removeItem('tempHighSchoolerInfo');
                            localStorage.removeItem('tempStudentInfo');
                        });
                        break;
                    case "College Student":
                        await saveCollegeStudent(user, currentUserData, () => {
                            localStorage.removeItem('tempCollegeStudentInfo');
                        });
                        break;
                    case "Professional":
                        await saveProfessional(user, currentUserData, () => {
                            localStorage.removeItem('tempProfessionalInfo');
                        });
                        break;
                    case "Staff":
                        await saveStaff(user, currentUserData, () => {
                            localStorage.removeItem('tempStaffInfo');
                        });
                        break;
                    default:
                        throw new Error('Invalid user type');
                }
            }

            // Ensure minimum loading time for animation
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

            await new Promise(resolve => setTimeout(resolve, remainingTime));

            // Check if user was trying to access a specific page before signing up
            const intendedDestination = sessionStorage.getItem('intendedDestination');
            if (intendedDestination) {
                // Clear the stored destination and navigate there
                sessionStorage.removeItem('intendedDestination');
                navigate(intendedDestination);
            } else {
                // Default behavior: navigate to home
                navigate('/Home');
            }
        } catch (error) {
            console.error('Error saving user data:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {isSubmitting && <PageLoading />}
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
                            {isHSFS ? (
                                <>
                                    {selectedOption === "High Schooler" && (
                                        <HSFSHighSchooler
                                            currentPage={currentPage}
                                            isSubmitting={isSubmitting}
                                            setCanSubmit={setCanSubmit}
                                            setUserData={setUserData}
                                        />
                                    )}
                                    {selectedOption === "Professional" && (
                                        <HSFSProfessional
                                            currentPage={currentPage}
                                            isSubmitting={isSubmitting}
                                            setCanSubmit={setCanSubmit}
                                            setUserData={setUserData}
                                        />
                                    )}
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
                        </main>
                        
                        <footer className="onboarding-footer">
                            <button
                                className={`prevButton ${currentPage < 2 ? 'hidden' : ''}`}
                                onClick={handlePrev}
                            >
                                Previous
                            </button>

                            <div className="footer-right">
                                {currentPage === numOfSections && !canSubmit && (
                                    <p className="validation-message">
                                        Please complete all required fields (*)
                                    </p>
                                )}
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
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}