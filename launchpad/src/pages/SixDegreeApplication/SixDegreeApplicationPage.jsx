import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SixDegreeApplicationPage.css';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import { IoCheckmarkCircle } from 'react-icons/io5';
import CustomSelect from '../../components/CustomSelect/CustomSelect.jsx';
import { careerInterests } from '../../pages/Onboarding/Options.jsx';
import PageLoading from '../../components/LoadingAnimation/PageLoading';

const SixDegreeApplicationPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Form state
  const [selectedPath, setSelectedPath] = useState(''); // 'existing' or 'new'
  const [selectedMentor, setSelectedMentor] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [mentorInterest, setMentorInterest] = useState('');
  const [existingMaterials, setExistingMaterials] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState('');
  const [interests, setInterests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const mentorOptions = [
    { value: 'charles_calomiris', label: 'Charles Calomiris' },
    { value: 'roy_baumeister', label: 'Roy Baumeister' },
    { value: 'gary_taubes', label: 'Gary Taubes' },
    { value: 'andrew_shtulman', label: 'Andrew Shtulman' },
    { value: 'other', label: 'Other Launchpad Mentors' }
  ];

  const materialOptions = [
    { value: 'research_notes', label: 'Research notes' },
    { value: 'draft_paper', label: 'Draft paper / proposal' },
    { value: 'outline', label: 'Outline / idea only' },
    { value: 'nothing', label: 'Nothing yet' }
  ];

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);

          // Pre-populate resume if it exists
          if (data.userResumePreview) {
            setResumePreview(data.userResumePreview);
          }

          // Don't pre-populate interests - encourage fresh, thoughtful responses
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load your profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Helper function to extract pure URL from resume field
  // Removes "private " or "public " prefixes if present
  const extractPureUrl = (urlString) => {
    if (!urlString) return '';

    // Remove "private " or "public " prefix (case insensitive)
    const cleaned = urlString.replace(/^(private|public)\s+/i, '').trim();
    return cleaned;
  };

  const handleMaterialToggle = (value) => {
    setExistingMaterials(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      }
      return [...prev, value];
    });
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setResumeFile(file);
      setResumePreview(file.name);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedPath) {
      toast.error('Please select a path');
      return;
    }

    if (selectedPath === 'existing') {
      if (!selectedMentor) {
        toast.error('Please select a mentor');
        return;
      }

      if (!workDescription.trim()) {
        toast.error('Please describe what you would like to work on');
        return;
      }

      if (!mentorInterest.trim()) {
        toast.error('Please explain why you are interested in this mentor');
        return;
      }

      if (existingMaterials.length === 0) {
        toast.error('Please select what materials you already have');
        return;
      }

      if (!resumePreview && !resumeFile) {
        toast.error('Please upload your résumé');
        return;
      }

      if (!interests.trim()) {
        toast.error('Please enter your academic interests');
        return;
      }
    }

    if (selectedPath === 'new') {
      if (!workDescription.trim()) {
        toast.error('Please describe what you would like to work on');
        return;
      }

      if (!resumePreview && !resumeFile) {
        toast.error('Please upload your résumé');
        return;
      }

      if (!interests.trim()) {
        toast.error('Please enter your academic interests');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      toast.loading('Submitting your application...');

      const applicationData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData?.userName || '',
        selectedPath,
        createdAt: serverTimestamp(),
      };

      if (selectedPath === 'existing') {
        applicationData.selectedMentor = typeof selectedMentor === 'object' ? selectedMentor.label : selectedMentor;
        applicationData.workDescription = workDescription;
        applicationData.mentorInterest = mentorInterest;
        applicationData.existingMaterials = existingMaterials;
        applicationData.resumeUrl = extractPureUrl(resumePreview);
        applicationData.interests = interests;
        applicationData.newResumeUploaded = !!resumeFile;
      }

      if (selectedPath === 'new') {
        applicationData.workDescription = workDescription;
        applicationData.resumeUrl = extractPureUrl(resumePreview);
        applicationData.interests = interests;
        applicationData.newResumeUploaded = !!resumeFile;
      }

      // Save to Firestore
      await addDoc(collection(db, '6_degree_applications'), applicationData);

      toast.dismiss();
      setShowSuccessModal(true);

      // Redirect to home page after 2.5 seconds
      setTimeout(() => {
        navigate('/Home');
      }, 2500);

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.dismiss();
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="six-degree-page-holder">
      <div className="six-degree-page-container">
        <div className="six-degree-logo-container">
          <img src="/assets/launchpad_logo.png" alt="Launchpad" className="six-degree-logo" />
        </div>

        <div className="six-degree-page-header">
          <h1 className="six-degree-page-title">6 Degree Mentor Application</h1>
          <p className="six-degree-page-subtitle">
            Connect with world-class mentors for research, projects, and academic pursuits.
          </p>
        </div>

        <div className="six-degree-form">
          {/* Choose Your Path */}
          <div className="six-degree-section">
            <h2 className="six-degree-section-title">Choose Your Path</h2>
            <p className="six-degree-section-subtitle">Which best describes what you're looking for?</p>

            <div className="six-degree-radio-group">
              <label className="six-degree-radio-option">
                <input
                  type="radio"
                  name="path"
                  value="existing"
                  checked={selectedPath === 'existing'}
                  onChange={(e) => setSelectedPath(e.target.value)}
                  disabled={isSubmitting}
                />
                <span className="six-degree-radio-label">Match me with an existing Launchpad Mentor</span>
              </label>

              <label className="six-degree-radio-option">
                <input
                  type="radio"
                  name="path"
                  value="new"
                  checked={selectedPath === 'new'}
                  onChange={(e) => setSelectedPath(e.target.value)}
                  disabled={isSubmitting}
                />
                <span className="six-degree-radio-label">Match me with a new mentor (outside the current Launchpad network)</span>
              </label>
            </div>
          </div>

          {/* PATH 1 - Match Me With an Existing Mentor */}
          {selectedPath === 'existing' && (
            <div className="six-degree-path-section">
              <h2 className="six-degree-path-title">PATH 1 — Match Me With an Existing Mentor</h2>

              {/* Question 1: Mentor Selection */}
              <div className="six-degree-field">
                <label className="six-degree-label">1. Which mentor are you interested in?</label>
                <CustomSelect
                  options={mentorOptions}
                  value={selectedMentor}
                  onChange={setSelectedMentor}
                  placeholder="Select a mentor..."
                  isDisabled={isSubmitting}
                />
              </div>

              {/* Question 2: Work Description */}
              <div className="six-degree-field">
                <label className="six-degree-label">2. What would you like to work on with this mentor?</label>
                <p className="six-degree-field-hint">Example: research paper, book project, competition prep, personal study track, etc.</p>
                <input
                  type="text"
                  className="six-degree-input"
                  placeholder="Describe your project or goal..."
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Question 3: Why This Mentor */}
              <div className="six-degree-field">
                <label className="six-degree-label">3. Why are you specifically interested in this mentor?</label>
                <textarea
                  className="six-degree-textarea"
                  placeholder="Explain your interest in this mentor..."
                  value={mentorInterest}
                  onChange={(e) => setMentorInterest(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>

              {/* Question 4: Existing Materials */}
              <div className="six-degree-field">
                <label className="six-degree-label">4. What do you already have related to this project?</label>
                <p className="six-degree-field-hint">Check all that apply</p>
                <div className="six-degree-checkbox-group">
                  {materialOptions.map(option => (
                    <label key={option.value} className="six-degree-checkbox-option">
                      <input
                        type="checkbox"
                        checked={existingMaterials.includes(option.value)}
                        onChange={() => handleMaterialToggle(option.value)}
                        disabled={isSubmitting}
                      />
                      <span className="six-degree-checkbox-label">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 5: Resume Upload */}
              <div className="six-degree-field">
                <label className="six-degree-label">5. Upload your résumé (required)</label>
                {resumePreview && !resumeFile && (
                  <div className="six-degree-resume-status">
                    <IoCheckmarkCircle className="six-degree-resume-icon" />
                    <span>Resume already on file</span>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={isSubmitting}
                  className="six-degree-file-input"
                />
                {resumeFile && (
                  <div className="six-degree-file-preview">
                    <span>Selected: {resumeFile.name}</span>
                  </div>
                )}
              </div>

              {/* Question 6: Academic Interests */}
              <div className="six-degree-field">
                <label className="six-degree-label">6. What are your top academic interests?</label>
                <input
                  type="text"
                  className="six-degree-input"
                  placeholder="e.g., Cognitive Psychology, Climate Science, Renaissance Literature"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* PATH 2 - Match Me With a New Mentor */}
          {selectedPath === 'new' && (
            <div className="six-degree-path-section">
              <h2 className="six-degree-path-title">PATH 2 — Match Me With a New Mentor</h2>

              {/* Question 1: Work Description */}
              <div className="six-degree-field">
                <label className="six-degree-label">1. What do you want to work on?</label>
                <p className="six-degree-field-hint">Example: research paper, book project, competition prep, personal study track, etc.</p>
                <textarea
                  className="six-degree-textarea"
                  placeholder="Describe your project or goal..."
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>

              {/* Question 2: Resume Upload */}
              <div className="six-degree-field">
                <label className="six-degree-label">2. Upload your résumé (required)</label>
                {resumePreview && !resumeFile && (
                  <div className="six-degree-resume-status">
                    <IoCheckmarkCircle className="six-degree-resume-icon" />
                    <span>Resume already on file</span>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={isSubmitting}
                  className="six-degree-file-input"
                />
                {resumeFile && (
                  <div className="six-degree-file-preview">
                    <span>Selected: {resumeFile.name}</span>
                  </div>
                )}
              </div>

              {/* Question 3: Academic Interests */}
              <div className="six-degree-field">
                <label className="six-degree-label">3. What are your top academic interests?</label>
                <input
                  type="text"
                  className="six-degree-input"
                  placeholder="e.g., Cognitive Psychology, Climate Science, Renaissance Literature"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedPath && (
            <div className="six-degree-actions">
              <button
                className="six-degree-btn six-degree-btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="six-degree-success-overlay">
          <div className="six-degree-success-modal">
            <IoCheckmarkCircle size={64} className="six-degree-success-icon" />
            <h2 className="six-degree-success-title">Application Submitted!</h2>
            <p className="six-degree-success-message">
              Thank you for applying! We'll review your application and get back to you soon at {currentUser.email}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SixDegreeApplicationPage;
