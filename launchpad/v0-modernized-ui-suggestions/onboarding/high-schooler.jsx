import React, { useEffect, useState } from 'react'
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown'
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options'
import { requiredQuestionsAnswered, saveHighSchooler } from '../../../services/onboardingServices'
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo'
import { useAuth } from '../../../contexts/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getFunctions, httpsCallable } from 'firebase/functions'
import EmailConfirmation from '../EmailConfirmation'
import { FaExclamationTriangle } from 'react-icons/fa'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { parentVerificationInitialTemplate } from '../../../utils/parentVerificationTemplates'
import './v0-onboarding-overrides.css'

function SafetyWarning({ isShortened = true }) {
  const [isExpanded, setIsExpanded] = useState(isShortened)

  return (
    <div className={`v0-warning-card ${!isExpanded && isShortened ? 'v0-warning-collapsed' : ''}`}>
      <div className="v0-warning-head">
        <div className="v0-warning-title">
          <FaExclamationTriangle className="v0-warning-icon" />
          <h3>Important Safety Guidelines</h3>
        </div>
        {isShortened && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="v0-icon-ghost"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <IoIosArrowUp size={18} /> : <IoIosArrowDown size={18} />}
          </button>
        )}
      </div>
      <div className="v0-warning-body">
        <p>As a high school student using Launchpad, please remember:</p>
        <ul>
          <li>Always maintain professional communication with adults</li>
          <li>Never share personal contact information outside the platform</li>
          <li>Report any inappropriate behavior immediately</li>
          <li>Keep all interactions focused on academic and career development</li>
          <li>If you feel uncomfortable with any interaction, contact your school administrator</li>
        </ul>
        <p className="v0-warning-ack">
          By continuing, you acknowledge these guidelines and agree to follow them.
        </p>
      </div>
      {!isExpanded && isShortened && <div className="v0-warning-fade" aria-hidden="true" />}
    </div>
  )
}

const highSchoolQuestionsConfig = [
  { id: 'userName', text: "What's your full name?", type: 'text', placeholder: 'E.g. Peffrey Jage', page: 1 },
  { id: 'userPfpPreview', text: 'Upload a profile picture:', type: 'file', optional: true, page: 1 },
  { id: 'areasOfInterest', text: "What are you interested in?", type: 'multi-select', options: careerInterests, page: 1 },
  { id: 'userResume', text: "Attach your resume to show professionals and alumni what you're about:", type: 'file', optional: true, page: 1 },
  { id: 'linkedinLink', optional: true, page: 1 },
  { id: 'email', optional: true },
  { id: 'graduationYear', text: 'What year do you graduate?', type: 'select', options: graduationYears, page: 2 },
  { id: 'collegeDecision', text: 'Have you decided on a college yet?', type: 'select', options: ['Yes', 'No'].map((o) => ({ value: o, label: o })), page: 3 },
  {
    id: 'collegeInterestsOrDecision',
    text: (collegeChosen) => `${collegeChosen ? 'What college will you be attending?' : 'What colleges are you interested in attending?'}`,
    type: (collegeChosen) => `${collegeChosen ? 'select' : 'multi-select'}`,
    options: [],
    page: 3,
  },
  { id: 'parentEmail', text: 'Parent/Guardian Email (required for full access)', type: 'text', page: 4 },
  { id: 'parentRequested', page: 5 },
]

export default function HighSchooler({ currentPage, isSubmitting, setCanSubmit, schoolInfo }) {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const getEmail = httpsCallable(getFunctions(), 'getEmail')

  const tempStudentInfo = JSON.parse(localStorage.getItem('tempStudentInfo') || '{}')

  const transformFullName = (name) => {
    return name ? name.split(', ')[1] + ' ' + name.split(', ')[0] : ''
  }

  const [highSchoolerData, setHighSchoolerData] = useState({
    userAboutMe: '',
    userName: transformFullName(tempStudentInfo.full_name),
    schoolAttending: schoolInfo.schoolDisplayName,
    schoolId: schoolInfo.schoolId,
    graduationYear: tempStudentInfo.graduation_year,
    areasOfInterest: [],
    userSkills: [],
    collegeDecision: '',
    collegeInterestsOrDecision: [],
    userResume: null,
    userResumePreview: '',
    email: '',
    userType: 'High Schooler',
    userPfpPreview: '',
    userPfp: null,
    linkedinLink: '',
    parentEmail: '',
    parentVerified: false,
    parentRequested: false,
  })

  const handleSubmit = async () => {
    try {
      await saveHighSchooler(currentUser, highSchoolerData, () => {
        toast.success('Information saved successfully!')
        navigate('/Home')
      })
    } catch (error) {
      toast.error('Failed to save information. Please try again.')
    }
  }

  useEffect(() => {
    if (requiredQuestionsAnswered(highSchoolQuestionsConfig, highSchoolerData)) {
      setCanSubmit(true)
    }
  }, [highSchoolerData, setCanSubmit])

  if (isSubmitting) {
    handleSubmit()
  }

  const handleChange = (id, label) => {
    setHighSchoolerData((prev) => ({ ...prev, [id]: label }))
  }

  useEffect(() => {
    const getUserEmail = async () => {
      const result = await getEmail()
      handleChange('email', result.data.email)
    }
    getUserEmail()
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <>
            <SafetyWarning isShortened={true} />
            <BasicUserInfo
              questionsForPage={highSchoolQuestionsConfig.filter((q) => q.page === 1)}
              setSelectedOptions={setHighSchoolerData}
              selectedOptions={highSchoolerData}
              handleChange={handleChange}
            />
          </>
        )
      case 2:
        return (
          <div className="onboardingQuestions" style={{ width: '500px' }}>
            {highSchoolQuestionsConfig
              .filter((q) => q.page === 2)
              .map((q) => (
                <OnboardingDropdown
                  key={q.id}
                  question={q.text}
                  options={q.options}
                  selectedOption={highSchoolerData[q.id] || (q.type === 'multi-select' ? [] : '')}
                  onChange={(label) => handleChange(q.id, label)}
                  type={q.type}
                />
              ))}
          </div>
        )
      case 3: {
        const collegeChosen = highSchoolerData['collegeDecision'] === 'Yes'
        return (
          <div className="onboardingQuestions" style={{ width: '500px' }}>
            <OnboardingDropdown
              question={highSchoolQuestionsConfig.find((q) => q.id === 'collegeDecision').text}
              options={highSchoolQuestionsConfig.find((q) => q.id === 'collegeDecision').options}
              selectedOption={highSchoolerData['collegeDecision'] || ''}
              onChange={(label) => handleChange('collegeDecision', label)}
              type="select"
            />
            <CollegeSearch
              question={highSchoolQuestionsConfig
                .find((q) => q.id === 'collegeInterestsOrDecision')
                .text(collegeChosen)}
              selectedOption={highSchoolerData['collegeInterestsOrDecision']}
              onChange={(label) => handleChange('collegeInterestsOrDecision', label)}
              type={highSchoolQuestionsConfig.find((q) => q.id === 'collegeInterestsOrDecision').type(collegeChosen)}
            />
          </div>
        )
      }
      case 4:
        return <ParentEmailPage selectedOptions={highSchoolerData} handleChange={handleChange} currentUser={currentUser} />
      default:
        return null
    }
  }

  return <>{renderPage()}</>
}

const ParentEmailPage = ({ selectedOptions, handleChange, currentUser }) => {
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [error, setError] = useState('')

  const validateParentEmail = () => {
    const studentEmail = selectedOptions['email'] || ''
    const parentEmail = selectedOptions['parentEmail'] || ''
    if (!parentEmail) {
      setError('Parent/Guardian email is required.')
      return false
    }
    if (studentEmail && parentEmail.trim().toLowerCase() === studentEmail.trim().toLowerCase()) {
      setError('Parent/Guardian email cannot be the same as your own email.')
      return false
    }
    setError('')
    return true
  }

  const handleRequestAccess = async () => {
    if (!validateParentEmail()) return
    setRequesting(true)

    const sendSESEmail = httpsCallable(getFunctions(), 'sendSESEmail')
    const generateVerificationLink = httpsCallable(getFunctions(), 'generateVerificationLink')

    const verificationLinkResult = await generateVerificationLink({
      uid: currentUser.uid,
      action: 'verify_account',
      schoolId: selectedOptions.schoolId,
    })
    const verificationLink = verificationLinkResult.data

    await sendSESEmail({
      recipient: [selectedOptions['parentEmail']],
      subject: "Verify Your Student's Account",
      htmlTemplate: parentVerificationInitialTemplate({
        studentName: selectedOptions['userName'],
        parentName: '',
        verificationLink,
      }),
      emailType: 'parent_verification',
    })

    setRequesting(false)
    setRequested(true)
  }

  useEffect(() => {
    handleChange('parentRequested', requested)
  }, [requested, handleChange])

  return (
    <div className="onboardingQuestions" style={{ width: '500px' }}>
      <div className="v0-note-card">
        <div className="v0-note-emoji">👨‍👩‍👧‍👦</div>
        <div>
          <div className="v0-note-title">Parental Consent Required</div>
          <div className="v0-note-body">
            To ensure your safety and comply with our policies, we require a parent or guardian to approve your access to
            Launchpad. We'll send them a secure agreement form to review and sign. You can still explore the app, but full
            functionality will be unlocked once your parent or guardian approves.
          </div>
        </div>
      </div>

      <label className="onboardingQuestion" style={{ fontWeight: 500 }}>
        Parent/Guardian Email (required for full access)
      </label>
      <input
        type="email"
        value={selectedOptions['parentEmail'] || ''}
        onChange={(e) => handleChange('parentEmail', e.target.value)}
        placeholder="e.g. parent@email.com"
        className="v0-input"
      />
      {error && <div className="v0-error">{error}</div>}

      <button
        type="button"
        onClick={handleRequestAccess}
        className={`v0-btn v0-btn-primary ${requested ? 'v0-btn-success' : ''}`}
        disabled={requesting || !selectedOptions['parentEmail']}
      >
        {requesting ? 'Requesting...' : requested ? 'Requested!' : 'Request Access'}
      </button>

      {requested && <div className="v0-success">Request sent! Your parent/guardian will receive an email to approve your access.</div>}
    </div>
  )
}
