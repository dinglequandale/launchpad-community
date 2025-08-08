import './profilemodal.css'
import React, { useEffect, useRef, useState } from 'react'
import { FaLink } from 'react-icons/fa'
import { BiFlag } from 'react-icons/bi'
import { IoCloseOutline } from 'react-icons/io5'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useModal } from '../../contexts/ModalContext'
import { useLocation } from 'react-router-dom'
import {
  displayColleges,
  displayFieldsOfInterest,
  displaySchools,
  getBasicUserDescription,
} from '../../services/userProfileServices'
import DefaultIcon from '../DefaultIcon/DefaultIcon'
import OrganizationProfile from '../Organizationprofile/OrganizationProfile'
import Loading from '../LoadingAnimation/Loading'
import { useReport } from '../../contexts/report/ReportContext'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase/firebaseConfig'
import { useConnections } from '../../contexts/ConnectionContext'
import { isConnectionApproved as checkApprovalFromService } from '../../services/connectionService'

/**
 * Modernized Profile Modal (v0 styling)
 * - Keeps all existing logic and data dependencies intact
 * - Fixes the local isConnectionApproved shadowing bug by using the service helper
 * - Uses cohesive "v0-" styles similar to the Home page
 */
export default function ProfileCard({
  userData,
  visibility,
  onClose,
  top,
  handleReferalClick,
  isConnected: initialConnectionStatus,
}) {
  const { currentUser } = useAuth()
  const { openConnectModal, openParentalConnectionModal } = useModal()
  const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport()
  const { approved = [], parent_approved = [], loading: connectionsLoading } = useConnections()

  const userBasicInfo = localStorage.getItem('basicUserInfo')
    ? JSON.parse(localStorage.getItem('basicUserInfo'))
    : {}
  const viewingUserType = userBasicInfo.userType
  const schoolId = localStorage.getItem('schoolId')
  const disableActions =
    userBasicInfo && userBasicInfo.userType === 'High Schooler' && !userBasicInfo.parentVerified

  const hideConnectBtn = viewingUserType !== 'High Schooler' && userData.userType === 'High Schooler'

  const isConnection =
    approved.some((conn) => conn.targetUserId === userData.userId || conn.initiateUserId === userData.userId) ||
    parent_approved.some((conn) => conn.targetUserId === userData.userId || conn.initiateUserId === userData.userId)

  const [opportunitiesData, setOpportunitiesData] = useState([])
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false)

  const menuRef = useRef(null)

  // Fetch user's opportunities
  useEffect(() => {
    if (!visibility || !schoolId || !userData?.userId) return

    const getOpportunityData = async () => {
      setOpportunitiesLoading(true)
      try {
        const opportunitiesRef = collection(db, 'tenants', schoolId, 'opportunities')
        const userOpportunityQuery = query(opportunitiesRef, where('createdBy', '==', userData.userId))
        const opportunitySnapshot = await getDocs(userOpportunityQuery)
        setOpportunitiesData(
          opportunitySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        )
      } catch (error) {
        console.log('error: ' + error)
      } finally {
        setOpportunitiesLoading(false)
      }
    }

    getOpportunityData()
  }, [visibility, schoolId, userData?.userId])

  // Click outside to close
  useEffect(() => {
    function onClickOutside(e) {
      const profileModal = menuRef.current
      const parentalModal = document.querySelector('.parental-connection-modal')
      if (profileModal && !profileModal.contains(e.target) && (!parentalModal || !parentalModal.contains(e.target))) {
        onClose()
      }
    }
    if (visibility) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [onClose, visibility])

  const userType = userData.userType
  const userName = userData.userName || ''

  const descType = () => {
    switch (userData.userType) {
      case 'High Schooler':
        return userData.collegeDecision === 'No' ? 'Dream Colleges' : 'Committed College'
      case 'Alumni':
        return 'Attending College'
      case 'Professional':
        return 'Current Position'
      default:
        return ''
    }
  }

  const basicInfoContent = {
    userPreface: getBasicUserDescription(userData, false),
    userFirstDesc: {
      desc1: `Fields of ${userType !== 'Professional' ? 'Interest' : 'Expertise'}`,
      desc2:
        userData.areasOfInterest && userData.areasOfInterest.length > 0
          ? displayFieldsOfInterest(userData.areasOfInterest, 'longer')
          : displayFieldsOfInterest(userData.areasOfInterest, 'longer'),
    },
    userSecondDesc: {
      desc1: `${descType()}`,
      desc2:
        userType === 'Professional'
          ? userData.industryPosition + (userData.companyName ? ' at ' + userData.companyName : '')
          : userType === 'Alumni'
          ? displayColleges([userData.collegeAttending])
          : Array.isArray(userData.collegeInterestsOrDecision)
          ? displayColleges([...userData.collegeInterestsOrDecision])
          : displayColleges([userData.collegeInterestsOrDecision]),
    },
    acceptedColleges: {
      desc1: `Accepted Colleges`,
      desc2: `${userData.acceptedColleges || ''}`,
    },
    affiliatedSchools: {
      desc1: `Affiliated School`,
      desc2: userData.schoolAttending ? `${displaySchools(userData.schoolAttending)}` : '',
    },
  }

  const handleConnectClick = () => {
    const parentVerified = userBasicInfo.parentVerified
    const isApproved = checkApprovalFromService(
      viewingUserType,
      currentUser,
      userData,
      parent_approved,
      approved,
      parentVerified,
    )
    if (!isApproved) {
      openParentalConnectionModal({ professionalData: userData })
      return
    }
    openConnectModal({ userData })
  }

  return (
    <>
      {visibility && (
        <div className="v0-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="User Profile">
          <div className="v0-modal-container" onClick={(e) => e.stopPropagation()} ref={menuRef}>
            <div className="v0-modal-actions">
              <button
                className="v0-icon-btn"
                aria-label="Report user"
                onClick={() => {
                  setReportTarget('User')
                  setReportVisibility(true)
                  setReportedUser(userData.userName)
                  setShowReportUserName(false)
                  onClose()
                }}
                title="Report"
              >
                <BiFlag size={22} />
              </button>
              <button className="v0-icon-btn" aria-label="Close" onClick={onClose} title="Close">
                <IoCloseOutline size={26} />
              </button>
            </div>

            <header className="v0-profile-header">
              <div className="v0-profile-avatar">
                {userData.userPfpPreview ? (
                  <img src={userData.userPfpPreview || "/placeholder.svg"} alt={`${userName}'s avatar`} />
                ) : (
                  <DefaultIcon size={50} length={'70px'} />
                )}
              </div>
              <div className="v0-profile-title">
                <div className="v0-name-row">
                  <h2 className="v0-name">{userName}</h2>
                  {isConnection && <span className="v0-chip v0-chip-success">Connected</span>}
                </div>
                {basicInfoContent.userPreface && (
                  <p className="v0-subtitle">{basicInfoContent.userPreface}</p>
                )}
              </div>
            </header>

            <section className="v0-info-grid">
              <div className="v0-info-item">
                <span className="v0-info-label">{basicInfoContent.userFirstDesc.desc1}</span>
                <span className="v0-info-value">{basicInfoContent.userFirstDesc.desc2}</span>
              </div>
              <div className="v0-info-item">
                <span className="v0-info-label">{basicInfoContent.userSecondDesc.desc1}</span>
                <span className="v0-info-value">{basicInfoContent.userSecondDesc.desc2}</span>
              </div>
              {userData.acceptedColleges && userData.acceptedColleges.length > 0 && (
                <div className="v0-info-item">
                  <span className="v0-info-label">{basicInfoContent.acceptedColleges.desc1}</span>
                  <span className="v0-info-value">{basicInfoContent.acceptedColleges.desc2}</span>
                </div>
              )}
            </section>

            {!hideConnectBtn && (
              <div className="v0-actions-row">
                {isConnection ? (
                  <button
                    className="v0-btn v0-btn-primary"
                    style={{ cursor: 'default' }}
                    onClick={() => {
                      if (!disableActions) handleConnectClick()
                    }}
                    title="Contact"
                  >
                    <FaLink size={18} />
                    <span>Contact</span>
                  </button>
                ) : (
                  <button
                    className="v0-btn v0-btn-primary"
                    disabled={disableActions}
                    title={disableActions ? 'Parent/guardian approval required' : 'Connect'}
                    onClick={() => {
                      if (!disableActions) handleConnectClick()
                    }}
                  >
                    <FaLink size={18} />
                    <span>Connect</span>
                  </button>
                )}
              </div>
            )}

            <hr className="v0-divider" />

            <main>
              {!opportunitiesLoading && opportunitiesData.length > 0 ? (
                <div className="v0-stack">
                  {opportunitiesData.map((opportunityData, index) => (
                    <div key={opportunityData.id || index} className="v0-section">
                      <h3 className="v0-section-title">
                        {userName.split(' ')[0]} is{' '}
                        {opportunityData.organizationType === 'Business' ? 'running' : 'offering'}{' '}
                        {opportunityData.organizationType === 'Internship' ? 'an' : 'a'}{' '}
                        <strong>
                          {opportunityData.organizationType.toLowerCase()}
                          {opportunityData.organizationType !== 'Business' && ' opportunity'}
                        </strong>
                        !
                      </h3>
                      <div className="v0-card">
                        <OrganizationProfile
                          location={'user_profile_public'}
                          organizationData={opportunityData}
                          handleReferalClick={handleReferalClick}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : opportunitiesLoading ? (
                <div className="v0-center">
                  <Loading />
                </div>
              ) : null}

              {userData.userAboutMe && (
                <section className="v0-section">
                  <h3 className="v0-section-title">{userName.split(' ')[0]}'s About Me</h3>
                  <div className="v0-card v0-prose">
                    <p>{userData.userAboutMe}</p>
                  </div>
                </section>
              )}

              {userData.userSkills && userData.userSkills.length > 0 && (
                <section className="v0-section">
                  <h3 className="v0-section-title">{userName.split(' ')[0]}'s Career-Ready Skills</h3>
                  <div className="v0-skills-grid">
                    {Object.entries(
                      userData.userSkills.reduce((acc, skill) => {
                        if (!acc[skill.skillCategory]) {
                          acc[skill.skillCategory] = []
                        }
                        acc[skill.skillCategory].push(skill.skillDescription)
                        return acc
                      }, {}),
                    ).map(([category, skills]) => (
                      <div key={category} className="v0-skill-category">
                        <div className="v0-skill-title">{category}</div>
                        <ul className="v0-skill-list">
                          {skills.map((skill, idx) => (
                            <li key={idx} className="v0-skill-pill">
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {userData.userResumePreview &&
                ((userData.userResumePreview.split(' ')[0]) !== 'private' || userType === 'Professional') && (
                  <section className="v0-section">
                    <h3 className="v0-section-title">{userName.split(' ')[0]}'s Resume</h3>
                    <div className="v0-card">
                      <iframe
                        src={userData.userResumePreview.split(' ')[userData.userResumePreview.split(' ').length - 1]}
                        title="Resume"
                        frameBorder="0"
                        style={{ width: '100%', height: 500 }}
                      />
                    </div>
                  </section>
                )}

              {userData.networkingLevel && userData.networkingLevel.length > 0 && (
                <section className="v0-section">
                  <h3 className="v0-section-title">{userName.split(' ')[0]}'s Commitment</h3>
                  <div className="v0-commitment-row">
                    {userData.networkingLevel.map((availability) => (
                      <span key={availability} className="v0-chip v0-chip-outline">
                        {availability}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      )}
    </>
  )
}
