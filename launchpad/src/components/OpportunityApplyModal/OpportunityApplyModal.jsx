import React, { useRef, useState } from 'react';
import './opportunity_apply_modal.css';
import { IoCloseOutline } from 'react-icons/io5';
import { LuMapPin, LuCalendar, LuBriefcase, LuClock, LuUsers, LuTarget } from 'react-icons/lu';

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
        <div className="v0-file-upload">
          <input 
            type="file" 
            accept="application/pdf" 
            id="resume-upload"
            onChange={handleFileChange}
            style={{display: "none"}}
          />
          <label htmlFor="resume-upload" className="v0-file-upload-label">
            <LuBriefcase size={16} />
            <span>{form.resume ? form.resume.name : 'Upload Resume (PDF)'}</span>
          </label>
        </div>
      );
    }
    if (id === 'intro') {
      return (
        <textarea
          className="v0-form-textarea"
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
          className="v0-form-textarea"
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
        className="v0-form-textarea"
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
    { label: 'Format', value: opportunityDetails.format, icon: <LuMapPin size={16} /> },
    { label: 'Eligibility', value: opportunityDetails.eligibility, icon: <LuUsers size={16} /> },
    { label: 'Compensation', value: opportunityDetails.compensation, icon: <LuBriefcase size={16} /> },
    { label: 'Duration', value: opportunityDetails.duration, icon: <LuClock size={16} /> },
    { label: 'Start Date', value: opportunityDetails.startDate, icon: <LuCalendar size={16} /> },
    { label: 'Est. Time Commitment', value: opportunityDetails.timeCommitment, icon: <LuTarget size={16} /> },
    { label: 'Deadline', value: opportunityDetails.deadline, icon: <LuCalendar size={16} /> },
  ];

  return (
    isOpen && (
      <div className="v0-opportunity-apply-overlay">
        <div className="v0-opportunity-apply-modal">
          <div className="v0-opportunity-apply-header">
            <h2 className="v0-opportunity-apply-title">Apply to {orgName ? orgName : "this Opportunity"}</h2>
            <button className="v0-opportunity-apply-close-btn" onClick={onClose}>
              <IoCloseOutline size={24} />
            </button>
          </div>

          <div className="v0-opportunity-apply-content">
            {/* Sidebar Recap */}
            <aside className="v0-opportunity-apply-sidebar">
              <h3 className="v0-opportunity-apply-sidebar-title">Opportunity Details</h3>
              <div className="v0-opportunity-apply-details">
                {details.map((d, i) => d.value && (
                  <div key={i} className="v0-opportunity-apply-detail-item">
                    <div className="v0-opportunity-apply-detail-icon">
                      {d.icon}
                    </div>
                    <div className="v0-opportunity-apply-detail-content">
                      <span className="v0-opportunity-apply-detail-label">{d.label}</span>
                      <span className="v0-opportunity-apply-detail-value">{d.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <main className="v0-opportunity-apply-main">
              <div className="v0-opportunity-apply-section">
                <h3 className="v0-opportunity-apply-section-title">How to Apply</h3>
                
                {/* Conditional UI based on applyType */}
                {applyType === 'Messages' && (
                  <form className="v0-opportunity-apply-form" onSubmit={e => {e.preventDefault(); /* handle submit */}}>
                    {requirements.map((id, i) => (
                      <div key={i} className="v0-opportunity-apply-field">
                        <label className="v0-opportunity-apply-field-label">{reqLabels[id] || id}</label>
                        {renderInput(id)}
                      </div>
                    ))}
                    <button type="submit" className="v0-opportunity-apply-submit-btn">
                      Submit Application
                    </button>
                  </form>
                )}

                {applyType === 'Email' && (
                  <div className="v0-opportunity-apply-email-section">
                    <div className="v0-opportunity-apply-email-info">
                      <p>To apply, send an email to <strong>{applyValue}</strong> with the subject line <strong>"{subject}"</strong> and include the following:</p>
                    </div>
                    <ul className="v0-opportunity-apply-requirements-list">
                      {requirements.map((id, i) => (
                        <li key={i}>{reqLabels[id] || id}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {applyType === 'Website' && (
                  <div className="v0-opportunity-apply-website-section">
                    <div className="v0-opportunity-apply-website-info">
                      <p>To apply, visit the following website and follow the instructions. Make sure to include:</p>
                    </div>
                    <ul className="v0-opportunity-apply-requirements-list">
                      {requirements.map((id, i) => (
                        <li key={i}>{reqLabels[id] || id}</li>
                      ))}
                    </ul>
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="v0-opportunity-apply-website-btn"
                    >
                      Go to Application Website
                    </a>
                  </div>
                )}
              </div>

              {/* Learn more section */}
              <div className="v0-opportunity-apply-learn-more">
                {opportunityDetails && (opportunityDetails.learnMoreType || opportunityDetails.learnMoreValue) ? (
                  <>
                    <p>Want to learn more about this {opportunityDetails.organizationType ? opportunityDetails.organizationType.toLowerCase() : 'opportunity'}?</p>
                    {opportunityDetails.learnMoreType === 'Website' && opportunityDetails.learnMoreValue ? (
                      <a href={opportunityDetails.learnMoreValue} target="_blank" rel="noopener noreferrer" className="v0-opportunity-apply-learn-more-link">
                        Visit their website
                      </a>
                    ) : opportunityDetails.learnMoreType === 'Email' && opportunityDetails.learnMoreValue ? (
                      <span>Email <a href={`mailto:${opportunityDetails.learnMoreValue}`} className="v0-opportunity-apply-learn-more-link">{opportunityDetails.learnMoreValue}</a> for more info.</span>
                    ) : opportunityDetails.learnMoreType === 'Messages' ? (
                      <span>Contact the host via Launchpad messages for more info.</span>
                    ) : null}
                  </>
                ) : (
                  <p>Want to learn more about this opportunity? Please contact the host for more information.</p>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  );
}