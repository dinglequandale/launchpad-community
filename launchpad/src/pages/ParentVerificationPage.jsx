import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { capitalizeFirstLetter } from './Homepage/Home';
import { studentAccountReminderTemplate, studentConnectionReminderTemplate } from '../utils/parentVerificationTemplates';
import './ParentVerificationPage.css';
import Loading from '../components/LoadingAnimation/Loading';

export default function ParentVerificationPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'verify_account'; // 'account' or 'connection'
  const token = searchParams.get('token');
  const schoolId = searchParams.get('school');
  
  // Validate that we have the required parameters
  if (!token || !schoolId) {
    return (
      <div className="verification-page">
        <div className="verification-container">
          <div className="verification-header">
            <img src="/assets/launchpad_logo.png" alt="Launchpad Logo" className="logo" />
            <h1>Invalid Verification Link</h1>
          </div>
          <div className="verification-content">
            <div className="error-icon">⚠</div>
            <h2>Invalid or Missing Information</h2>
            <p>This verification link is missing required information. Please request a new verification link from your student.</p>
            <div className="verification-actions">
              <a href="https://launchpadhouston.com" className="home-link">
                Return to Launchpad
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [parentName, setParentName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [connectionDecision, setConnectionDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'general', 'student_setup', 'token_expired', 'connection_issue'

  const [studentEmail, setStudentEmail] = useState("");
  const [connectionUserName, setConnectionUserName] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // For demo, you could get childName and connectionName from query params too
  const childName = searchParams.get('child') || 'your child';
  const connectionName = searchParams.get('connection') || 'the professional';

  const getErrorMessage = (error, errorType) => {
    if (errorType === 'student_setup') {
      return {
        title: 'Student Account Setup Required',
        message: 'Your student needs to complete their Launchpad account setup before you can verify their account. Please ask them to finish setting up their profile and try again.',
        action: 'Contact your student to complete their account setup'
      };
    } else if (errorType === 'token_expired') {
      return {
        title: 'Verification Link Expired',
        message: 'This verification link has expired. Please request a new one from your student or contact Launchpad support.',
        action: 'Request a new verification link'
      };
    } else if (errorType === 'connection_issue') {
      return {
        title: 'Connection Request Issue',
        message: 'There was an issue processing the connection request. This might be because the student hasn\'t completed their profile setup yet.',
        action: 'Ask your student to complete their profile and try again'
      };
    } else {
      return {
        title: 'Something went wrong',
        message: 'We encountered an unexpected error. This might be because your student\'s account isn\'t fully set up yet.',
        action: 'Please try again or contact Launchpad support if the issue persists'
      };
    }
  };

  const analyzeError = (errorMessage) => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('student') || message.includes('account') || message.includes('setup') || message.includes('profile')) {
      return 'student_setup';
    } else if (message.includes('token') || message.includes('expired') || message.includes('invalid')) {
      return 'token_expired';
    } else if (message.includes('connection') || message.includes('request')) {
      return 'connection_issue';
    } else {
      return 'general';
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (!parentName.trim()) return;
    setLoading(true);
    setError('');
    setErrorType('');
    try {
      const verifyParentToken = httpsCallable(getFunctions(), 'verifyParentToken');
      const {email, connectionName, success} = await verifyParentToken({
        token,
        schoolId,
        parentName,
        decision: 'yes',
      });

      setConnectionUserName(connectionName);
      setStudentEmail(email);
      setSubmitted(true);
      setVerificationSuccess(success);

    } catch (err) {
      const errorType = analyzeError(err.message || '');
      setErrorType(errorType);
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
      if(verificationSuccess){
        const sendSESEmail = httpsCallable(getFunctions(), 'sendSESEmail');
        const result = await sendSESEmail({
          recipient: [ studentEmail ], 
          subject: "Your Connection Was Approved! 🎉", 
          htmlTemplate: studentConnectionReminderTemplate({connectionName: connectionUserName}),
          emailType: "student_notification"});
      };
    }
  };

  const handleConnectionDecision = async (decision) => {
    setConnectionDecision(decision);
    setLoading(true);
    setError('');
    setErrorType('');
    try {
      const verifyParentToken = httpsCallable(getFunctions(), 'verifyParentToken');
      const {email, success} = await verifyParentToken({
        token,
        schoolId,
        decision,
      });

      setConnectionUserName(connectionName);
      setStudentEmail(email);
      setSubmitted(true);
      setVerificationSuccess(success);

    } catch (err) {
      const errorType = analyzeError(err.message || '');
      setErrorType(errorType);
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
      if(verificationSuccess){
        const sendSESEmail = httpsCallable(getFunctions(), 'sendSESEmail');
        const result = await sendSESEmail({
          recipient: [ studentEmail ], 
          subject: "Your Launchpad Account Was Approved! 🎉", 
          htmlTemplate: studentAccountReminderTemplate(),
          emailType: "student_notification"});
      }
    }
  };

  const renderSuccessContent = () => (
    <div className="verification-content">
      <div className="success-icon">✓</div>
      <h2>Thank You!</h2>
      <p>Your response has been recorded successfully.</p>
      <p>We appreciate your involvement in keeping Launchpad safe and supportive for students.</p>
      <div className="verification-actions">
        <a href="https://launchpadhouston.com" className="home-link">
          Return to Launchpad
        </a>
      </div>
    </div>
  );

  const renderConnectionContent = () => (
    <div className="verification-content">
      <div className="connection-icon">🤝</div>
      <h2>Connection Request Approval</h2>
      <p><strong>{capitalizeFirstLetter(childName)}</strong> would like to connect with <strong>{connectionName}</strong> on Launchpad.</p>
      <p>Do you approve this connection request?</p>
      
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <div className="error-content">
            <h4 className="error-title">{getErrorMessage(error, errorType).title}</h4>
            <p className="error-description">{getErrorMessage(error, errorType).message}</p>
            <p className="error-action">{getErrorMessage(error, errorType).action}</p>
          </div>
        </div>
      )}
      
      <div className="verification-actions">
        <button 
          onClick={() => handleConnectionDecision('yes')} 
          disabled={loading} 
          className="approve-btn"
        >
          {loading ? (
            <>
              <Loading size={16} />
              Processing...
            </>
          ) : (
            'Yes, I Approve'
          )}
        </button>
        <button 
          onClick={() => handleConnectionDecision('no')} 
          disabled={loading} 
          className="reject-btn"
        >
          No, I Do Not Approve
        </button>
      </div>
    </div>
  );

  const renderAccountContent = () => (
    <div className="verification-content">
      <div className="account-icon">👨‍👩‍👧‍👦</div>
      <h2>Parental Consent Required</h2>
      <p>To help keep students safe, we require parental or guardian consent before allowing access to Launchpad.</p>
      
      <div className="terms-box">
        <h3>Legal Terms</h3>
        <ul>
          <li>I am the parent or legal guardian of <strong>{childName}</strong>.</li>
          <li>I consent to their use of the Launchpad platform for educational and networking purposes.</li>
          <li>I understand that Launchpad takes steps to protect student privacy and safety, but I am responsible for monitoring my child's online activity.</li>
          <li>I may revoke this consent at any time by contacting Launchpad support.</li>
        </ul>
      </div>

      <form onSubmit={handleAccountSubmit} className="consent-form">
        <div className="form-group">
          <label htmlFor="parentName">Your Full Name (Digital Signature)</label>
          <input
            id="parentName"
            type="text"
            value={parentName}
            onChange={e => setParentName(e.target.value)}
            required
            placeholder="Enter your full name"
            className="name-input"
          />
        </div>
        
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠</div>
            <div className="error-content">
              <h4 className="error-title">{getErrorMessage(error, errorType).title}</h4>
              <p className="error-description">{getErrorMessage(error, errorType).message}</p>
              <p className="error-action">{getErrorMessage(error, errorType).action}</p>
            </div>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading || !parentName.trim()} 
          className="approve-btn"
        >
          {loading ? (
            <>
              <Loading size={16} />
              Processing...
            </>
          ) : (
            'I Agree and Approve'
          )}
        </button>
      </form>
    </div>
  );

  return (
    <div className="verification-page">
      <div className="verification-container">
        <div className="verification-header">
          <img src="/assets/launchpad_logo.png" alt="Launchpad Logo" className="logo" />
          <h1>Parent Verification</h1>
        </div>
        
        {submitted ? renderSuccessContent() : 
         mode === 'connection' ? renderConnectionContent() : 
         renderAccountContent()}
      </div>
    </div>
  );
} 