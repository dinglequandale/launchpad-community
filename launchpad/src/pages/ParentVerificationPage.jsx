import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { capitalizeFirstLetter } from './Homepage/Home';
import { studentAccountReminderTemplate, studentConnectionReminderTemplate } from '../utils/parentVerificationTemplates';

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
          htmlTemplate: studentConnectionReminderTemplate({connectionName: connectionUserName})});
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
          htmlTemplate: studentAccountReminderTemplate()});
      }
    }
  };

  if (submitted) {
    return (
      <div style={{width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <h2>Thank you!</h2>
          <p>Your response has been recorded. We appreciate your involvement in keeping Launchpad safe and supportive for students.</p>
        </div>
      </div>
    );
  }

  if (mode === 'connection') {
    return (
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh", backgroundImage: "url(/assets/onboarding_backdrop.png)"}}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", textAlign: "center", maxWidth: 500, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h2>Approve Connection Request</h2>
        <p>{capitalizeFirstLetter(childName)} would like to connect with {connectionName} on Launchpad. Do you approve this connection?</p>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <button onClick={() => handleConnectionDecision('yes')} disabled={loading} style={{ padding: '10px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>Yes, I Approve</button>
          <button onClick={() => handleConnectionDecision('no')} disabled={loading} style={{ padding: '10px 24px', background: '#eee', color: '#333', border: 'none', borderRadius: 6, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>No, I Do Not Approve</button>
        </div>
        {loading && <div style={{ marginTop: 16 }}>Submitting...</div>}
      </div>
      </div>
    );
  }

  // Default: account approval
  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <h2>Parental Consent for Launchpad</h2>
      <p>To help keep students safe, we require parental or guardian consent before allowing access to Launchpad. Please review the terms below and sign your name to approve your child's account.</p>
      <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, margin: '18px 0', fontSize: '0.98em' }}>
        <b>Legal Terms (Sample):</b>
        <ul>
          <li>I am the parent or legal guardian of {childName}.</li>
          <li>I consent to their use of the Launchpad platform for educational and networking purposes.</li>
          <li>I understand that Launchpad takes steps to protect student privacy and safety, but I am responsible for monitoring my child's online activity.</li>
          <li>I may revoke this consent at any time by contacting Launchpad support.</li>
        </ul>
      </div>
      <form onSubmit={handleAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label>
          Your Full Name (Signature):
          <input
            type="text"
            value={parentName}
            onChange={e => setParentName(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 6 }}
          />
        </label>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Submitting...' : 'I Agree and Approve'}
        </button>
      </form>
    </div>
  );
} 