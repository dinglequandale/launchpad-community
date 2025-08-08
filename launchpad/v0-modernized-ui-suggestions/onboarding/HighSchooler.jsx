import React, { useEffect, useState } from 'react'
import { Shield, Mail, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown'
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options'
import { requiredQuestionsAnswered, saveHighSchooler } from '../../../services/onboardingServices'
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo'
import { useAuth } from '../../../contexts/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { parentVerificationInitialTemplate } from '../../../utils/parentVerificationTemplates'
import './HighSchooler.css'

function SafetyNotice({ isCollapsed = true }) {
  const [collapsed, setCollapsed] = useState(isCollapsed)

  return (
    <div className={`safety-notice ${collapsed ? 'collapsed' : ''}`}>
      <div className="safety-notice-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="safety-notice-title">
          <Shield className="safety-icon" size={20} />
          <h3>Safety Guidelines</h3>
        </div>
        {isCollapsed && (
          <button className="safety-toggle" type="button">
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        )}
      </div>
      
      <div className="safety-notice-content">
        <p>As a high school student, please remember to:</p>
        <ul>
          <li>Maintain professional communication with adults</li>
          <li>Never share personal contact information outside the platform</li>
          <li>Report any inappropriate behavior immediately</li>
          <li>Keep interactions focused on academic and career development</li>
          <li>Contact your school administrator if you feel uncomfortable</li>
        </ul>
        <p className="safety-acknowledgment">
          By continuing, you acknowledge and agree to follow these guidelines.
        </p>
      </div>
    </div>
  )
}

const highSchoolQuestionsConfig = [
  { id: 'userName', text: "What's your full name?", type: 'text', placeholder: 'E.g. John Smith', page: 1 },
  { id: 'userPfpPreview', text: 'Upload a profile picture:', type: 'file', optional: true, page: 1 },
  { id: 'areasOfInterest', text: 'What are you interested in?', type: 'multi-select', options: careerInterests, page: 1 },
  { id: 'userResume', text: 'Attach your resume (optional):', type: 'file', optional: true, page: 1 },
  { id: 'linkedinLink', optional: true, page: 1 },
  { id: 'email', optional: true },
  { id: 'graduationYear', text: 'What year do you graduate?', type: 'select', options: graduationYears, page: 2 },
  { id: 'collegeDecision', text: 'Have you decided on a college yet?', type: 'select', options: ['Yes', 'No'].map(o => ({ value: o, label: o })), page: 3 },
  {
    id: 'collegeInterestsOrDecision',
    text: (collegeChosen) => collegeChosen ? 'What college will you be attending?' : 'What colleges are you interested in?',
    type: (collegeChosen) => collegeChosen ? 'select' : 'multi-select',
    options: [],
    page: 3,
  },
  { id: 'parentEmail', text: 'Parent/Guardian Email', type: 'text', page: 4 },
  { id: 'parentRequested', page: 5 },
]

export default function HighSchooler({ currentPage, isSubmitting, setCanSubmit, schoolInfo }) {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const getEmail = httpsCallable(getFunctions(), 'getEmail')

  const tempStudentInfo = JSON.parse(localStorage.getItem('tempStudentInfo') || '{}')

  const [highSchoolerData, setHighSchoolerData] = useState({
    userAboutMe: '',
    userName: tempStudentInfo.full_name ? 
      tempStudentInfo.full_name.split(', ')[1] + ' ' + tempStudentInfo.full_name.split(', ')[0] : '',
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
        toast.success('Profile created successfully!')
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

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const result = await getEmail()
        handleChange('email', result.data.email)
      } catch (error) {
        console.error('Error getting email:', error)
      }
    }
    getUserEmail()
  }, [])

  if (isSubmitting) {
    handleSubmit()
  }

  const handleChange = (id, value) => {
    setHighSchoolerData(prev => ({ ...prev, [id]: value }))
  }

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="onboarding-page">
            <SafetyNotice />
            <div className="form-section">
              <BasicUserInfo
                questionsForPage={highSchoolQuestionsConfig.filter(q => q.page === 1)}
                setSelectedOptions={setHighSchoolerData}
                selectedOptions={highSchoolerData}
                handleChange={handleChange}
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="onboarding-page">
            <div className="form-section">
              <h2 className="page-title">Academic Information</h2>
              {highSchoolQuestionsConfig
                .filter(q => q.page === 2)
                .map(question => (
                  <OnboardingDropdown
                    key={question.id}
                    question={question.text}
                    options={question.options}
                    selectedOption={highSchoolerData[question.id] || (question.type === 'multi-select' ? [] : '')}
                    onChange={(value) => handleChange(question.id, value)}
                    type={question.type}
                  />
                ))}
            </div>
          </div>
        )
      case 3: {
        const collegeChosen = highSchoolerData.collegeDecision === 'Yes'
        return (
          <div className="onboarding-page">
            <div className="form-section">
              <h2 className="page-title">College Plans</h2>
              <OnboardingDropdown
                question="Have you decided on a college yet?"
                options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
                selectedOption={highSchoolerData.collegeDecision || ''}
                onChange={(value) => handleChange('collegeDecision', value)}
                type="select"
              />
              <CollegeSearch
                question={collegeChosen ? 'What college will you be attending?' : 'What colleges are you interested in?'}
                selectedOption={highSchoolerData.collegeInterestsOrDecision}
                onChange={(value) => handleChange('collegeInterestsOrDecision', value)}
                type={collegeChosen ? 'select' : 'multi-select'}
              />
            </div>
          </div>
        )
      }
      case 4:
        return <ParentEmailPage selectedOptions={highSchoolerData} handleChange={handleChange} currentUser={currentUser} />
      default:
        return null
    }
  }

  return renderPage()
}

const ParentEmailPage = ({ selectedOptions, handleChange, currentUser }) => {
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = () => {
    const studentEmail = selectedOptions.email || ''
    const parentEmail = selectedOptions.parentEmail || ''
    
    if (!parentEmail) {
      setError('Parent/Guardian email is required.')
      return false
    }
    
    if (studentEmail && parentEmail.toLowerCase() === studentEmail.toLowerCase()) {
      setError('Parent email cannot be the same as your email.')
      return false
    }
    
    setError('')
    return true
  }

  const handleRequestAccess = async () => {
    if (!validateEmail()) return
    
    setRequesting(true)
    try {
      const sendSESEmail = httpsCallable(getFunctions(), 'sendSESEmail')
      const generateVerificationLink = httpsCallable(getFunctions(), 'generateVerificationLink')

      const verificationResult = await generateVerificationLink({
        uid: currentUser.uid,
        action: 'verify_account',
        schoolId: selectedOptions.schoolId,
      })

      await sendSESEmail({
        recipient: [selectedOptions.parentEmail],
        subject: "Verify Your Student's Account",
        htmlTemplate: parentVerificationInitialTemplate({
          studentName: selectedOptions.userName,
          parentName: '',
          verificationLink: verificationResult.data,
        }),
        emailType: 'parent_verification',
      })

      setRequested(true)
    } catch (error) {
      console.error('Error sending verification email:', error)
      setError('Failed to send verification email. Please try again.')
    } finally {
      setRequesting(false)
    }
  }

  useEffect(() => {
    handleChange('parentRequested', requested)
  }, [requested, handleChange])

  return (
    <div className="onboarding-page">
      <div className="form-section">
        <div className="parent-notice">
          <div className="parent-notice-icon">
            <Shield size={24} />
          </div>
          <div className="parent-notice-content">
            <h3>Parental Consent Required</h3>
            <p>
              For your safety and to comply with our policies, we need a parent or guardian to approve your access. 
              We'll send them a secure verification email. You can explore the app, but full features will be 
              unlocked after approval.
            </p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Parent/Guardian Email <span className="required">*</span>
          </label>
          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              className="form-input"
              placeholder="parent@example.com"
              value={selectedOptions.parentEmail || ''}
              onChange={(e) => handleChange('parentEmail', e.target.value)}
            />
          </div>
          {error && (
            <div className="error-message">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`request-btn ${requested ? 'success' : ''}`}
          onClick={handleRequestAccess}
          disabled={requesting || !selectedOptions.parentEmail}
        >
          {requesting ? (
            <>
              <div className="spinner" />
              Sending...
            </>
          ) : requested ? (
            <>
              <CheckCircle size={18} />
              Request Sent!
            </>
          ) : (
            <>
              <Mail size={18} />
              Send Verification Email
            </>
          )}
        </button>

        {requested && (
          <div className="success-message">
            <CheckCircle size={16} />
            Verification email sent! Your parent/guardian will receive instructions to approve your account.
          </div>
        )}
      </div>
    </div>
  )
}
