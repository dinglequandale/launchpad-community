import React, { useRef, useState } from 'react';
import './opportunity_apply_modal.css';
import { CgClose } from 'react-icons/cg';

// requirements: array of strings or ids, applyType: 'Messages' | 'Email' | 'Website', applyValue: string (email or url)
// opportunityDetails: { format, eligibility, compensation, duration, startDate, timeCommitment, deadline, ... }
export default function OpportunityApplyModal({
  isOpen = true,
  onClose,
  requirements = [],
  applyType = 'Messages',
  applyValue = '',
  orgName = '',
  opportunityDetails = {},
}) {
  // Map default ids to labels
  const reqLabels = {
    resume: 'Resume (as a PDF attachment)',
    intro: 'A short intro about yourself',
    why: 'A concise answer to the question(s): "Why are you interested in this opportunity?"',
  };
  // State for form fields
  const [form, setForm] = useState({
    intro: '',
    why: '',
    resume: null,
    custom: {},
  });

  const handleInputChange = (id, value) => {
    if (['intro', 'why'].includes(id)) {
      setForm(f => ({ ...f, [id]: value }));
    } else {
      setForm(f => ({ ...f, custom: { ...f.custom, [id]: value } }));
    }
  };
  const handleFileChange = (e) => {
    setForm(f => ({ ...f, resume: e.target.files[0] }));
  };

  // Render requirement input
  const renderInput = (id) => {
    if (id === 'resume') {
      return (
        <>
          <input type="file" accept="application/pdf" style={{display: "none"}} onChange={handleFileChange}/>
        </>
      );
    }
    if (id === 'intro') {
      return (
        <textarea
          placeholder="Write a short intro about yourself..."
          value={form.intro}
          onChange={e => handleInputChange('intro', e.target.value)}
          rows={3}
        />
      );
    }
    if (id === 'why') {
      return (
        <textarea
          placeholder="Why are you interested in this opportunity?"
          value={form.why}
          onChange={e => handleInputChange('why', e.target.value)}
          rows={3}
        />
      );
    }
    // Custom requirement
    return (
      <textarea
        placeholder={id}
        value={form.custom[id] || ''}
        onChange={e => handleInputChange(id, e.target.value)}
        rows={2}
      />
    );
  };

  // Compose mailto body for Email type
  const getMailtoBody = () => {
    let body = '';
    requirements.forEach(id => {
      if (id === 'resume') {
        body += 'Resume: [attach PDF]\n';
      } else if (id === 'intro') {
        body += `Intro: ${form.intro}\n`;
      } else if (id === 'why') {
        body += `Why interested: ${form.why}\n`;
      } else {
        body += `${id}: ${form.custom[id] || ''}\n`;
      }
    });
    return encodeURIComponent(body);
  };

  // Compose subject for Email
  const subject = `Application for ${orgName || 'Opportunity'}`;

  // Compose website link (if any)
  const websiteUrl = applyType === 'Website' ? applyValue : '';

  // Sidebar details (recap)
  const details = [
    { label: 'Format', value: opportunityDetails.format },
    { label: 'Eligibility', value: opportunityDetails.eligibility },
    { label: 'Compensation', value: opportunityDetails.compensation },
    { label: 'Duration', value: opportunityDetails.duration },
    { label: 'Start Date', value: opportunityDetails.startDate },
    { label: 'Est. Time Commitment', value: opportunityDetails.timeCommitment },
    { label: 'Deadline', value: opportunityDetails.deadline },
  ];

  return (
    isOpen && (
      <div className="opportunity-apply-modal-overlay">
        <div className="opportunity-apply-modal pro-layout">
          <CgClose className="btnClose" size={25} onClick={onClose} style={{position: 'absolute', right: 18, top: 18, cursor: 'pointer'}}/>
          <h2 style={{textAlign: 'center', marginBottom: 8}}>Apply to {orgName ? orgName : "this Opportunity"}</h2>
          {/* <hr style={{marginBottom: 16, height:"20px"}} /> */}
          <div className="opportunity-apply-modal-flex">
            <hr />
            {/* Sidebar Recap */}
            <aside className="opportunity-apply-sidebar">
              <div className="recap-header">Recap:</div>
              <div className="recap-list">
                {details.map((d, i) => d.value && (
                  <div key={i} className="recap-row">
                    <span className="recap-label">{d.label}:</span>
                    <span className="recap-value">{d.value}</span>
                  </div>
                ))}
              </div>
            </aside>
            <div className="opportunity-apply-divider" />
            {/* Main Content */}
            <main className="opportunity-apply-main">
              {/* <h2 className="apply-header">Apply to {orgName ? orgName : "this Opportunity"}</h2> */}
              <div className="recap-header">How to Apply:</div>
              {/* <div style={{marginBottom: 18, fontSize: 15, color: '#222'}}>
                Please include the following in your application:
                <ul style={{margin: '8px 0 0 18px', padding: 0}}>
                  {requirements.map((id, i) => (
                    <li key={i}>{reqLabels[id] || id}</li>
                  ))}
                </ul>
              </div> */}
              {/* Conditional UI based on applyType */}
              {applyType === 'Messages' && (
                <form style={{display: 'flex', flexDirection: 'column', gap: 14}} onSubmit={e => {e.preventDefault(); /* handle submit */}}>
                  {requirements.map((id, i) => (
                    <div key={i} style={{marginBottom: 8}}>
                      <div style={{fontWeight: 500, marginBottom: 2}}>{reqLabels[id] || id}</div>
                      {renderInput(id)}
                    </div>
                  ))}
                  <button type="submit" className="btnSaveChanges" style={{marginTop: 10}}>Submit Application</button>
                </form>
              )}
              {applyType === 'Email' && (
                <div>
                  <div style={{marginBottom: 8}}>
                    To apply, send an email to <b>{applyValue}</b> with the subject line <b>"{subject}"</b> and include the following:
                  </div>
                  <ul style={{margin: 0, paddingLeft: 18}}>
                    {requirements.map((id, i) => (
                      <li key={i}>{reqLabels[id] || id}</li>
                    ))}
                  </ul>
                  {/* <a
                    href={`mailto:${applyValue}?subject=${encodeURIComponent(subject)}&body=${getMailtoBody()}`}
                    className="btnSaveChanges"
                    style={{display: 'inline-block', marginTop: 14, textDecoration: 'none'}}
                  >
                    Open Email App
                  </a> */}
                </div>
              )}
              {applyType === 'Website' && (
                <div>
                  <div style={{marginBottom: 8}}>
                    To apply, visit the following website and follow the instructions. Make sure to include:
                  </div>
                  <ul style={{margin: 0, paddingLeft: 18}}>
                    {requirements.map((id, i) => (
                      <li key={i}>{reqLabels[id] || id}</li>
                    ))}
                  </ul>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btnSaveChanges"
                    style={{display: 'inline-block', marginTop: 14, textDecoration: 'none'}}
                  >
                    Go to Application Website
                  </a>
                </div>
              )}
              {/* Learn more section */}
              <div style={{marginTop: 'auto', marginBottom: 0, fontSize: '0.93rem', color: '#4a5870', opacity: 0.85, paddingTop: 24, textAlign: 'center'}}>
                {opportunityDetails && (opportunityDetails.learnMoreType || opportunityDetails.learnMoreValue) ? (
                  <>
                    Want to learn more about this {opportunityDetails.organizationType ? opportunityDetails.organizationType.toLowerCase() : 'opportunity'}?&nbsp;
                    {opportunityDetails.learnMoreType === 'Website' && opportunityDetails.learnMoreValue ? (
                      <a href={opportunityDetails.learnMoreValue} target="_blank" rel="noopener noreferrer" style={{color: 'var(--secondary, #2a4b6a)', textDecoration: 'underline'}}>Visit their website</a>
                    ) : opportunityDetails.learnMoreType === 'Email' && opportunityDetails.learnMoreValue ? (
                      <span>Email <a href={`mailto:${opportunityDetails.learnMoreValue}`} style={{color: 'var(--secondary, #2a4b6a)', textDecoration: 'underline'}}>{opportunityDetails.learnMoreValue}</a> for more info.</span>
                    ) : opportunityDetails.learnMoreType === 'Messages' ? (
                      <span> Contact the host via Launchpad messages for more info.</span>
                    ) : null}
                  </>
                ) : (
                  <>Want to learn more about this opportunity? Please contact the host for more information.</>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  );
}