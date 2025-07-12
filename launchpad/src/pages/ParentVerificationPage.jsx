import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { capitalizeFirstLetter } from './Homepage/Home';
import { studentAccountReminderTemplate, studentConnectionReminderTemplate } from '../utils/parentVerificationTemplates';
import './ParentVerificationPage.css';

export default function ParentVerificationPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'verify_account'; // 'account' or 'connection'
  const token = searchParams.get('token');
  const schoolId = searchParams.get('school');
  const [parentName, setParentName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [connectionDecision, setConnectionDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [studentEmail, setStudentEmail] = useState("");
  const [connectionUserName, setConnectionUserName] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // For demo, you could get childName and connectionName from query params too
  const childName = searchParams.get('child') || 'your child';
  const connectionName = searchParams.get('connection') || 'the professional';

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (!parentName.trim()) return;
    setLoading(true);
    setError('');
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
          <p>{error}</p>
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
              <div className="loading-spinner-small"></div>
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
            <p>{error}</p>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading || !parentName.trim()} 
          className="approve-btn"
        >
          {loading ? (
            <>
              <div className="loading-spinner-small"></div>
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