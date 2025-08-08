import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { auth } from '../../firebase/firebaseConfig'
import { useAuth } from '../../contexts/auth/AuthContext'
import CollegeStudent from './CollegeStudent/CollegeStudent'
import HighSchooler from './HighSchooler/HighSchooler'
import Professional from './Professional/Professional'
import Staff from './Staff/Staff'
import ProgressBar from '../../components/Progressbar/ProgressBar'
import Loading from '../../components/LoadingAnimation/Loading'
import './Onboarding.css'

export default function Onboarding() {
  const [numOfSections, setNumOfSections] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOption, setSelectedOption] = useState(() => localStorage.getItem('userType') || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)

  const user = auth.currentUser
  const { userLoggedIn } = useAuth()
  const location = useLocation()
  const tempSchoolInfo = location.state ?? JSON.parse(localStorage.getItem('tempSchoolInfo') || '{}')

  const { schoolId, schoolDisplayName, userRole } = tempSchoolInfo

  useEffect(() => {
    const setUserToken = async () => {
      if (!schoolId) return
      
      try {
        const functions = getFunctions()
        const createSchoolClaim = httpsCallable(functions, 'createSchoolClaim')
        await createSchoolClaim({ schoolId })
        await user.getIdToken(true)
        console.log('User token created')
      } catch (error) {
        console.error('Error creating user token:', error)
      }
    }
    
    setUserToken()
  }, [schoolId, user])

  useEffect(() => {
    setNumOfSections(getNumOfSections())
  }, [selectedOption])

  const getNumOfSections = () => {
    switch (selectedOption) {
      case 'High Schooler': return 4
      case 'College Student': return 3
      case 'Professional': return 4
      case 'Staff': return 3
      default: return 0
    }
  }

  const handleContinue = () => {
    setCurrentPage(currentPage + 1)
  }

  const handlePrev = () => {
    setCurrentPage(currentPage - 1)
  }

  const handleSubmit = () => {
    if (canSubmit) {
      setIsSubmitting(true)
    }
  }

  if (!tempSchoolInfo.schoolId) {
    return <Navigate to="/school-signup" replace />
  }

  if (!userLoggedIn) {
    return <Navigate to="/Landing" replace />
  }

  return (
    <>
      {isSubmitting && <div className="loading-overlay" />}
      
      <div className="onboarding-container">
        <div className="onboarding-background" />
        
        <div className="onboarding-content">
          <header className="onboarding-header">
            <div className="logo-container">
              <img src="/assets/launchpad_logo.png" alt="Launchpad" className="logo" />
            </div>
            
            {currentPage > 0 && (
              <ProgressBar
                numOfSections={numOfSections}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                showArrows={false}
              />
            )}
          </header>

          <main className="onboarding-main">
            {selectedOption === 'High Schooler' && (
              <HighSchooler
                schoolInfo={tempSchoolInfo}
                currentPage={currentPage}
                isSubmitting={isSubmitting}
                setCanSubmit={setCanSubmit}
              />
            )}
            {selectedOption === 'College Student' && (
              <CollegeStudent
                schoolInfo={tempSchoolInfo}
                currentPage={currentPage}
                isSubmitting={isSubmitting}
                setCanSubmit={setCanSubmit}
              />
            )}
            {selectedOption === 'Professional' && (
              <Professional
                schoolInfo={tempSchoolInfo}
                currentPage={currentPage}
                isSubmitting={isSubmitting}
                setCanSubmit={setCanSubmit}
              />
            )}
            {userRole === 'admin' && (
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
              className={`nav-btn secondary ${currentPage < 2 ? 'hidden' : ''}`}
              onClick={handlePrev}
            >
              Previous
            </button>
            
            {currentPage !== numOfSections ? (
              <button className="nav-btn primary" onClick={handleContinue}>
                Continue
              </button>
            ) : (
              <button
                className={`nav-btn primary ${!canSubmit ? 'disabled' : ''}`}
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loading style={{ maxWidth: '20px' }} />
                    Submitting...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            )}
          </footer>
        </div>
      </div>
    </>
  )
}
