import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { CgClose } from 'react-icons/cg';
import './UnsubscribePage.css';
import Loading from '../components/LoadingAnimation/Loading';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'invalid'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('invalid');
      setMessage('Invalid unsubscribe link. Missing token.');
      return;
    }

    processUnsubscribe(token);
  }, [searchParams]);

  const processUnsubscribe = async (token) => {
    try {
      const processUnsubscribeFunction = httpsCallable(getFunctions(), 'processUnsubscribe');
      const result = await processUnsubscribeFunction({ token });
      console.log("Result: " + result)
      
      setStatus('success');
      setMessage(result.data.message);
      setEmail(result.data.email);
    } catch (error) {
      console.error('Unsubscribe error:', error);
      
      if (error.code === 'functions/not-found') {
        setStatus('invalid');
        setMessage('Invalid unsubscribe link. This link may have expired or already been used.');
      } else if (error.code === 'functions/failed-precondition') {
        setStatus('error');
        setMessage(error.message || 'This unsubscribe link has already been used or has expired.');
      } else {
        setStatus('error');
        setMessage('An error occurred while processing your unsubscribe request. Please try again later.');
      }
    }
  };

  const handleResubscribe = async () => {
    try {
      // You can implement a resubscribe function here if needed
      setMessage('Resubscribe functionality can be implemented here.');
    } catch (error) {
      console.error('Resubscribe error:', error);
      setMessage('Error processing resubscribe request.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="unsubscribe-content">
            <Loading size={40} />
            <h2>Processing your request...</h2>
            <p>Please wait while we process your unsubscribe request.</p>
          </div>
        );

      case 'success':
        return (
          <div className="unsubscribe-content">
            <div className="success-icon">✓</div>
            <h2>Successfully Unsubscribed</h2>
            <p>{message}</p>
            {email && <p>Email: <strong>{email}</strong></p>}
            <p>You will no longer receive emails from Launchpad.</p>
            <div className="unsubscribe-actions">
              <button onClick={handleResubscribe} className="resubscribe-btn">
                Resubscribe to Emails
              </button>
              <a href="https://launchpadhouston.com" className="home-link">
                Return to Launchpad
              </a>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="unsubscribe-content">
            <div className="error-icon">⚠</div>
            <h2>Error</h2>
            <p>{message}</p>
            <div className="unsubscribe-actions">
              <a href="https://launchpadhouston.com" className="home-link">
                Return to Launchpad
              </a>
            </div>
          </div>
        );

      case 'invalid':
        return (
          <div className="unsubscribe-content">
            <div className="error-icon">⚠</div>
            <h2>Invalid Link</h2>
            <p>{message}</p>
            <div className="unsubscribe-actions">
              <a href="https://launchpadhouston.com" className="home-link">
                Return to Launchpad
              </a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="unsubscribe-page">
      <div className="unsubscribe-container">
        <div className="unsubscribe-header">
          <img src="/assets/launchpad_logo.png" alt="Launchpad Logo" className="logo" />
          <h1>Email Preferences</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
} 