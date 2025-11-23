// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import './OpportunityForm.css';
// import { careerInterests } from '../../../pages/Onboarding/Options';

// const OpportunityForm = ({ 
//   onClose, 
//   isEditing = false, 
//   opportunityId = null, 
//   opportunityData = null,
// //   careerInterests = [] // Assuming this is passed as a prop
// }) => {
//   const [isSaving, setIsSaving] = useState(false);
//   const [formErrors, setFormErrors] = useState({});
  
//   const [organizationData, setOrganizationData] = useState({
//     title: '',
//     organizationType: '',
//     organizationHostCompany: '',
//     organizationTags: [],
//     applicantPosition: '',
//     applicantExpectations: '',
//     isPaid: 'Unpaid',
//     applicants: {
//       highSchoolers: false,
//       collegeStudents: false,
//       professionals: false
//     },
//     workLocation: 'On-site',
//     timeFrame: '',
//     learnMore: '',
//     apply: {
//       email: false,
//       website: false,
//       messages: false,
//       link: ''
//     },
//     applicationRequirements: {
//       transcript: false,
//       resume: false,
//       recommendationLetter: false,
//       coverLetter: false,
//       portfolio: false
//     },
//     applicationQuestions: '',
//     applicationSubmission: {
//       email: false,
//       website: false,
//       messages: false,
//       link: ''
//     },
//     organizationLogoPreview: null,
//     createdByUserName: "",
//     startDate: '',
//     deadline: '',
//   });

//   const [organizationLogo, setOrganizationLogo] = useState(null);
//   const [noDeadlineDate, setNoDeadlineDate] = useState(false);
//   const [noStartDate, setNoStartDate] = useState(false);

//   // Initialize form data based on editing status
//   useEffect(() => {
//     if (opportunityData !== null && isEditing) {
//       setOrganizationData({...opportunityData});
//       return;
//     }

//     const userInfo = localStorage.getItem("basicUserInfo");
//     const { userName } = userInfo ? JSON.parse(userInfo) : { userName: "" };
    
//     setOrganizationData({
//       title: '',
//       organizationType: '',
//       organizationHostCompany: '',
//       organizationTags: [],
//       applicantPosition: '',
//       applicantExpectations: '',
//       isPaid: 'Unpaid',
//       applicants: {
//         highSchoolers: false,
//         collegeStudents: false,
//         professionals: false
//       },
//       workLocation: 'On-site',
//       timeFrame: '',
//       learnMore: '',
//       apply: {
//         email: false,
//         website: false,
//         messages: false,
//         link: ''
//       },
//       applicationRequirements: {
//         transcript: false,
//         resume: false,
//         recommendationLetter: false,
//         coverLetter: false,
//         portfolio: false
//       },
//       applicationQuestions: '',
//       applicationSubmission: {
//         email: false,
//         website: false,
//         messages: false,
//         link: ''
//       },
//       organizationLogoPreview: null,
//       createdByUserName: userName,
//       startDate: '',
//       deadline: '',
//     });
//   }, [isEditing, opportunityData]);

//   const organizationQuestionsConfig = [
//     {
//       id: "organizationType",
//       text: "Workplace Opportunity Type:",
//       type: "select",
//       options: ["Select Type", "Shadowing", "Internship", "Community Service", "Job"],
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: true,
//       page: 1,
//     },
//     {
//       id: "organizationHostCompany",
//       text: "Host company or organization:",
//       type: "text",
//       placeholder: "e.g., \"ExxonMobil\"",
//       maxLength: 40,
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: true,
//     },
//     {
//       id: "deadline",
//       text: "Application Deadline:",
//       type: "date",
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: false,
//     },
//     {
//       id: "startDate",
//       text: "Opportunity Start Date:",
//       type: "date",
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: false,
//     },
  
//     {
//       id: "organizationTags",
//     //   text: `${getApplicantType()}'s Field(s) of Work`,
//       type: "multi-select",
//       includers: ["Internship", "Shadowing", "Job", ""],
//       required: true,
//       options: careerInterests,
//     },
//     {
//       id: "applicantPosition",
//       text: `${organizationData.organizationType === "Community Service" ? "Volunteering" : organizationData.organizationType} Position Title`,
//       type: "text",
//       maxLength: 40,
//     //   placeholder: organizationData.organizationType ? `e.g., "${getPositionTitlePlaceholder()}"` : "",
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: (orgType) => orgType !== "Community Service",
//     },
//     {
//       id: "applicantExpectations",
//       text: `${organizationData.organizationType} Description, Requirements, and Expectations`,
//       type: "textarea",
//       maxLength: 500,
//     //   placeholder: `Briefly describe what the ${getApplicantType().toLowerCase()}(s) will do and the experience needed to succeed throughout this ${`${organizationData.organizationType && organizationData.organizationType.toLowerCase()} `}opportunity. You'll have a chance to share a link to more details later.`,
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: true,
//     },
  
//     // Page 3
//     {
//       id: "isPaid",
//       text: "Is this opportunity paid or unpaid?",
//       type: "select",
//       options: ["Paid", "Unpaid"],
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: true,
//     },
//     {
//       id: "workLocation",
//       text: "What is the format of the opportunity?",
//       type: "select",
//       options: ["On-site", "Remote", "Hybrid"],
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: true,
//     },
//     {
//       id: "applicants",
//       text: "What type of students can apply?",
//       type: "select",
//       options: ["High Schoolers/College Students", "High Schoolers", "College Students"],
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: true,
//     },
//     {
//       id: "timeFrame",
//       text: "What is the opportunity's duration?",
//       type: "select",
//       options: ["TBD","<1 Week", "1 Week", "2 Weeks", "3 Weeks", "4+ Weeks", "6+ Weeks", "Indefinite"],
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: true,
//     },
  
//     // Page 4
//     {
//       id: "learnMore",
//       text: "Where can students find more information on this opportunity?",
//       type: "link",
//       placeholder: "Paste a link here!",
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: true,
//     },
//     {
//       id: "apply",
//       text: `How should students ${organizationData.organizationType === "Community Service" ? "volunteer" : "apply"} for this opportunity?`,
//       type: "link",
//       placeholder: "Paste a link here!",
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: true,
//     },
//     {
//       id: "organizationLogoPreview",
//       text: "Upload a logo that embodies your opportunity! (optional)",
//       type: "file",
//       accept: ".jpg",
//       includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
//       required: false,
//     },
//   ];


//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setOrganizationData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear error for this field if it exists
//     if (formErrors[name]) {
//       setFormErrors(prev => ({
//         ...prev,
//         [name]: null
//       }));
//     }
//   };

//   const handleTagsChange = (selectedTags) => {
//     setOrganizationData(prev => ({
//       ...prev,
//       organizationTags: selectedTags
//     }));
    
//     // Clear error if it exists
//     if (formErrors.organizationTags) {
//       setFormErrors(prev => ({
//         ...prev,
//         organizationTags: null
//       }));
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setOrganizationData(prev => ({
//           ...prev,
//           organizationLogoPreview: reader.result
//         }));
//       };
//       reader.readAsDataURL(file);
//       setOrganizationLogo(file);
//     }
//   };

//   const handleDateChange = (e) => {
//     const { name, value } = e.target;
//     setOrganizationData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleCheckboxChange = (section, field) => {
//     setOrganizationData(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [field]: !prev[section][field]
//       }
//     }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     // Basic required fields
//     ['title', 'organizationType', 'organizationHostCompany'].forEach(field => {
//       if (!organizationData[field]) {
//         newErrors[field] = 'This field is required';
//       }
//     });
    
//     // Check if at least one applicant type is selected
//     if (!organizationData.applicants.highSchoolers && 
//         !organizationData.applicants.collegeStudents && 
//         !organizationData.applicants.professionals) {
//       newErrors.applicants = 'Please select at least one applicant type';
//     }
    
//     // Check if at least one application method is selected and has a link if needed
//     if (organizationData.apply.website && !organizationData.apply.link) {
//       newErrors.applyLink = 'Please provide a website link';
//     }
    
//     if (organizationData.applicationSubmission.website && !organizationData.applicationSubmission.link) {
//       newErrors.submissionLink = 'Please provide a website link';
//     }
    
//     setFormErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const saveOpportunityData = async () => {
//     if (!validateForm()) {
//       return;
//     }
    
//     try {
//       setIsSaving(true);
//       await toast.promise(
//         saveOpportunity(organizationData, organizationLogo, currentUser, isEditing, opportunityId),
//         {
//           loading: isEditing ? 'Updating opportunity...' : 'Creating opportunity...',
//           success: isEditing ? 'Opportunity updated successfully!' : 'Opportunity created successfully!',
//           error: (err) => `Failed to ${isEditing ? 'update' : 'create'} opportunity: ${err.message}`,
//         }
//       );
//       onClose();
//     } catch (error) {
//       console.error("Error saving opportunity: ", error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="opportunity-form-container">
//         <div className="opportunity-form-header">
//             <button className="back-button" onClick={onClose}>
//             ← Back
//             </button>
//             <h2>Opportunity Draft</h2>
//             <div className="header-actions">
//             <button className="preview-button">Preview</button>
//             <button className="save-button" onClick={saveOpportunityData} disabled={isSaving}>
//                 {isSaving ? "Saving..." : "Save"}
//             </button>
//             <button className="publish-button" onClick={saveOpportunityData} disabled={isSaving}>
//                 Publish
//             </button>
//             </div>
//         </div>

//       <div className="opportunity-form-content">
//         {/* General Info Section */}
//         <div className="form-section">
//             <div className='section-title-container'>
//                 <div className='section-highlight'></div>
//                 <span className="section-title">General Info</span> 
//             </div>
//             <div className="form-field">
//                 <label htmlFor="title">Title:</label>
//                 <input
//                 type="text"
//                 id="title"
//                 name="title"
//                 value={organizationData.title || ''}
//                 onChange={handleInputChange}
//                 className={formErrors.title ? 'error' : ''}
//                 />
//                 {formErrors.title && <div className="error-message">{formErrors.title}</div>}
//             </div>
            
//             <div className="form-grid-2">
//                 <div className="form-field">
//                 <label htmlFor="organizationType">Type of Opportunity:</label>
//                 <select
//                     id="organizationType"
//                     name="organizationType"
//                     value={organizationData.organizationType || ''}
//                     onChange={handleInputChange}
//                     className={formErrors.organizationType ? 'error' : ''}
//                 >
//                     <option value="">Select Type</option>
//                     <option value="Shadowing">Shadowing</option>
//                     <option value="Internship">Internship</option>
//                     <option value="Community Service">Community Service</option>
//                     <option value="Job">Job</option>
//                 </select>
//                 {formErrors.organizationType && <div className="error-message">{formErrors.organizationType}</div>}
//                 </div>
                
//                 <div className="form-field">
//                 <label htmlFor="organizationHostCompany">Host Company/Organization:</label>
//                 <input
//                     type="text"
//                     id="organizationHostCompany"
//                     name="organizationHostCompany"
//                     value={organizationData.organizationHostCompany || ''}
//                     onChange={handleInputChange}
//                     placeholder='e.g., "ExxonMobil"'
//                     className={formErrors.organizationHostCompany ? 'error' : ''}
//                 />
//                 {formErrors.organizationHostCompany && <div className="error-message">{formErrors.organizationHostCompany}</div>}
//                 </div>
//             </div>
          
//             <div className="form-grid-2">
//                 <div className="form-field">
//                 <label htmlFor="startDate">Start Date:</label>
//                 <div className="date-field">
//                     <input
//                     type="date"
//                     id="startDate"
//                     name="startDate"
//                     value={organizationData.startDate || ''}
//                     onChange={handleDateChange}
//                     disabled={noStartDate}
//                     />
//                     <div className="checkbox-container">
//                     <input 
//                         type="checkbox" 
//                         id="no-startDate" 
//                         checked={noStartDate}
//                         onChange={() => {
//                         setNoStartDate(!noStartDate);
//                         if (!noStartDate) {
//                             handleDateChange({
//                             target: { name: 'startDate', value: '' }
//                             });
//                         }
//                         }}
//                     />
//                     <label htmlFor="no-startDate">No determined date</label>
//                     </div>
//                 </div>
//                 </div>
            
//                 <div className="form-field">
//                 <label htmlFor="deadline">Application Deadline:</label>
//                 <div className="date-field">
//                     <input
//                     type="date"
//                     id="deadline"
//                     name="deadline"
//                     value={organizationData.deadline || ''}
//                     onChange={handleDateChange}
//                     disabled={noDeadlineDate}
//                     />
//                     <div className="checkbox-container">
//                     <input 
//                         type="checkbox" 
//                         id="no-deadline" 
//                         checked={noDeadlineDate}
//                         onChange={() => {
//                         setNoDeadlineDate(!noDeadlineDate);
//                         if (!noDeadlineDate) {
//                             handleDateChange({
//                             target: { name: 'deadline', value: '' }
//                             });
//                         }
//                         }}
//                     />
//                     <label htmlFor="no-deadline">No determined date</label>
//                     </div>
//                 </div>
//                 </div>
//             </div>
        
            
//             <div className="form-field">
//                 <label htmlFor="organizationTags">Field of work/Type of Profession:</label>
//                 <input
//                 type="text"
//                 id="organizationTags"
//                 name="organizationTags"
//                 value={organizationData.organizationTags.join(', ') || ''}
//                 onChange={(e) => {
//                     const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
//                     handleTagsChange(tags);
//                 }}
//                 />
//             </div>
            
//             <div className="form-grid-2">
//                 <div className="form-field">
//                 <label>Is this opportunity paid or unpaid?</label>
//                 <div className="radio-group">
//                     <div className="radio-option">
//                     <input
//                         type="radio"
//                         id="paid"
//                         name="isPaid"
//                         value="Paid"
//                         checked={organizationData.isPaid === 'Paid'}
//                         onChange={handleInputChange}
//                     />
//                     <label htmlFor="paid">Paid</label>
//                     </div>
//                     <div className="radio-option">
//                     <input
//                         type="radio"
//                         id="unpaid"
//                         name="isPaid"
//                         value="Unpaid"
//                         checked={organizationData.isPaid === 'Unpaid'}
//                         onChange={handleInputChange}
//                     />
//                     <label htmlFor="unpaid">Unpaid</label>
//                     </div>
//                 </div>
//                 </div>
                
//                 <div className="form-field">
//                 <label>What is the format of the opportunity?</label>
//                 <div className="radio-group">
//                     <div className="radio-option">
//                     <input
//                         type="radio"
//                         id="onsite"
//                         name="workLocation"
//                         value="On-site"
//                         checked={organizationData.workLocation === 'On-site'}
//                         onChange={handleInputChange}
//                     />
//                     <label htmlFor="onsite">On-site</label>
//                     </div>
//                     <div className="radio-option">
//                     <input
//                         type="radio"
//                         id="online"
//                         name="workLocation"
//                         value="Online"
//                         checked={organizationData.workLocation === 'Online'}
//                         onChange={handleInputChange}
//                     />
//                     <label htmlFor="online">Online</label>
//                     </div>
//                     <div className="radio-option">
//                     <input
//                         type="radio"
//                         id="hybrid"
//                         name="workLocation"
//                         value="Hybrid"
//                         checked={organizationData.workLocation === 'Hybrid'}
//                         onChange={handleInputChange}
//                     />
//                     <label htmlFor="hybrid">Hybrid</label>
//                     </div>
//                 </div>
//                 </div>
//             </div>
            
//             <div className="form-field">
//                 <label>Short Summary:</label>
//                 <textarea
//                 id="applicantExpectations"
//                 name="applicantExpectations"
//                 value={organizationData.applicantExpectations || ''}
//                 onChange={handleInputChange}
//                 placeholder="Blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, basic info to indicate to the user what to input"
//                 rows={4}
//                 />
//             </div>
            
//             <div className="form-field">
//                 <label>What type of students can apply?</label>
//                 <div className="checkbox-group">
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="highSchoolers"
//                     checked={organizationData.applicants.highSchoolers}
//                     onChange={() => handleCheckboxChange('applicants', 'highSchoolers')}
//                     />
//                     <label htmlFor="highSchoolers">High Schoolers</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="collegeStudents"
//                     checked={organizationData.applicants.collegeStudents}
//                     onChange={() => handleCheckboxChange('applicants', 'collegeStudents')}
//                     />
//                     <label htmlFor="collegeStudents">College Students</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="professionals"
//                     checked={organizationData.applicants.professionals}
//                     onChange={() => handleCheckboxChange('applicants', 'professionals')}
//                     />
//                     <label htmlFor="professionals">Professionals</label>
//                 </div>
//                 </div>
//                 {formErrors.applicants && <div className="error-message">{formErrors.applicants}</div>}
//             </div>
            
//             <div className="form-field">
//                 <label>How can students get more info?</label>
//                 <div className="checkbox-group">
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="infoEmail"
//                     checked={organizationData.apply.email}
//                     onChange={() => handleCheckboxChange('apply', 'email')}
//                     />
//                     <label htmlFor="infoEmail">Email</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="infoMessages"
//                     checked={organizationData.apply.messages}
//                     onChange={() => handleCheckboxChange('apply', 'messages')}
//                     />
//                     <label htmlFor="infoMessages">Messages</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="infoWebsite"
//                     checked={organizationData.apply.website}
//                     onChange={() => handleCheckboxChange('apply', 'website')}
//                     />
//                     <label htmlFor="infoWebsite">Website</label>
//                 </div>
//                 </div>
//                 {organizationData.apply.website && (
//                 <input
//                     type="url"
//                     id="applyLink"
//                     name="apply.link"
//                     value={organizationData.apply.link || ''}
//                     onChange={(e) => setOrganizationData(prev => ({
//                     ...prev,
//                     apply: {
//                         ...prev.apply,
//                         link: e.target.value
//                     }
//                     }))}
//                     placeholder="Website link"
//                     className={formErrors.applyLink ? 'error' : ''}
//                 />
//                 )}
//                 {formErrors.applyLink && <div className="error-message">{formErrors.applyLink}</div>}
//             </div>
            
//             <div className="form-field">
//                 <label>Add a Photo:</label>
//                 <div className="file-upload">
//                 {organizationData.organizationLogoPreview ? (
//                     <div className="logo-preview-container">
//                     <img 
//                         src={organizationData.organizationLogoPreview} 
//                         alt="Organization logo" 
//                         className="logo-preview" 
//                     />
//                     <button
//                         type="button"
//                         onClick={() => {
//                         setOrganizationData(prev => ({
//                             ...prev,
//                             organizationLogoPreview: null
//                         }));
//                         setOrganizationLogo(null);
//                         }}
//                         className="remove-logo"
//                     >
//                         Remove
//                     </button>
//                     </div>
//                 ) : (
//                     <label className="btnFileUpload">
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         style={{ display: 'none' }}
//                     />
//                     <span>+</span>
//                     </label>
//                 )}
//                 </div>
//             </div>
//             </div>
            
//             {/* Application Info Section */}
//             <div className="form-section">
//             <h3 className="section-title">Application Info:</h3>
            
//             <div className="form-field">
//                 <label>Requirements for applications:</label>
//                 <div className="checkbox-group">
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="transcript"
//                     checked={organizationData.applicationRequirements.transcript}
//                     onChange={() => handleCheckboxChange('applicationRequirements', 'transcript')}
//                     />
//                     <label htmlFor="transcript">Transcript</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="resume"
//                     checked={organizationData.applicationRequirements.resume}
//                     onChange={() => handleCheckboxChange('applicationRequirements', 'resume')}
//                     />
//                     <label htmlFor="resume">Resume</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="recommendationLetter"
//                     checked={organizationData.applicationRequirements.recommendationLetter}
//                     onChange={() => handleCheckboxChange('applicationRequirements', 'recommendationLetter')}
//                     />
//                     <label htmlFor="recommendationLetter">Recommendation Letter</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="coverLetter"
//                     checked={organizationData.applicationRequirements.coverLetter}
//                     onChange={() => handleCheckboxChange('applicationRequirements', 'coverLetter')}
//                     />
//                     <label htmlFor="coverLetter">Cover Letter</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="portfolio"
//                     checked={organizationData.applicationRequirements.portfolio}
//                     onChange={() => handleCheckboxChange('applicationRequirements', 'portfolio')}
//                     />
//                     <label htmlFor="portfolio">Portfolio</label>
//                 </div>
//                 </div>
//             </div>
            
//             <div className="form-field">
//                 <label>Questions required for the Applications to Response:</label>
//                 <textarea
//                 id="applicationQuestions"
//                 name="applicationQuestions"
//                 value={organizationData.applicationQuestions || ''}
//                 onChange={handleInputChange}
//                 placeholder="Blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, blah, basic info to indicate to the user what to input"
//                 rows={4}
//                 />
//             </div>
            
//             <div className="form-field">
//                 <label>How should students submit their application?</label>
//                 <div className="checkbox-group">
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="submitEmail"
//                     checked={organizationData.applicationSubmission.email}
//                     onChange={() => handleCheckboxChange('applicationSubmission', 'email')}
//                     />
//                     <label htmlFor="submitEmail">Email</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="submitMessages"
//                     checked={organizationData.applicationSubmission.messages}
//                     onChange={() => handleCheckboxChange('applicationSubmission', 'messages')}
//                     />
//                     <label htmlFor="submitMessages">Messages</label>
//                 </div>
//                 <div className="checkbox-option">
//                     <input
//                     type="checkbox"
//                     id="submitWebsite"
//                     checked={organizationData.applicationSubmission.website}
//                     onChange={() => handleCheckboxChange('applicationSubmission', 'website')}
//                     />
//                     <label htmlFor="submitWebsite">Website</label>
//                 </div>
//                 </div>
//                 {organizationData.applicationSubmission.website && (
//                 <input
//                     type="url"
//                     id="submissionLink"
//                     name="applicationSubmission.link"
//                     value={organizationData.applicationSubmission.link || ''}
//                     onChange={(e) => setOrganizationData(prev => ({
//                     ...prev,
//                     applicationSubmission: {
//                         ...prev.applicationSubmission,
//                         link: e.target.value
//                     }
//                     }))}
//                     placeholder="Website link"
//                     className={formErrors.submissionLink ? 'error' : ''}
//                 />
//                 )}
//                 {formErrors.submissionLink && <div className="error-message">{formErrors.submissionLink}</div>}
//             </div>
//             </div>
//         </div>

//         <div className="form-actions">
//             <button 
//             type="button" 
//             onClick={saveOpportunityData}
//             className="submit-button"
//             disabled={isSaving}
//             >
//             {isSaving ? "Saving..." : (isEditing ? "Update" : "Create")} Opportunity
//             </button>
//         </div>
//         </div>
//     );
// };

// export default OpportunityForm;