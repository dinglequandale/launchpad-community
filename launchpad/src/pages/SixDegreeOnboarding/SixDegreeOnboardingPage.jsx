import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SixDegreeOnboardingPage.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage, auth } from '../../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import { IoCheckmarkCircle, IoCloseCircle, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import CustomSelect from '../../components/CustomSelect/CustomSelect.jsx';
import { saveSixDegreesOnboarding } from '../../services/onboardingServices';
import { HighSchoolSearch, CitySearch, careerInterests } from '../../pages/Onboarding/Options.jsx';

const SixDegreeOnboardingPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/6-degree-application');
    }
  }, [currentUser, navigate]);

  // General Information state
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    schoolAttending: '', // Changed to match HighSchoolSearch
    gradeLevel: '',
    city: '',
    areasOfInterest: [], // Fields of interest
    hasCollegeDecision: '', // 'yes' or 'no'
    collegeDecision: '', // College name if hasCollegeDecision is 'yes'
    password: '',
    confirmPassword: ''
  });

  // Application state (same as SixDegreeApplicationPage)
  const [selectedPath, setSelectedPath] = useState(''); // 'existing' or 'new'
  const [selectedMentor, setSelectedMentor] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [mentorInterest, setMentorInterest] = useState('');
  const [existingMaterials, setExistingMaterials] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [interests, setInterests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // File upload constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
  const MAX_TOTAL_FILES = 5;
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

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

  const gradeOptions = [
    { value: '9', label: '9th Grade' },
    { value: '10', label: '10th Grade' },
    { value: '11', label: '11th Grade' },
    { value: '12', label: '12th Grade' }
  ];

  // Handle form data changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Password validation
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return {
      isValid: minLength && hasUpper && hasLower && hasNumber,
      errors: { minLength, hasUpper, hasLower, hasNumber }
    };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleMaterialToggle = (value) => {
    setExistingMaterials(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      }
      return [...prev, value];
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (uploadedFiles.length + files.length > MAX_TOTAL_FILES) {
      toast.error(`You can upload a maximum of ${MAX_TOTAL_FILES} files`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Please upload only PDF or Word documents`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }

    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  // Upload files to Firebase Storage
  const uploadFilesToStorage = async (files, userId) => {
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${userId}_${timestamp}_${index}_${sanitizedFileName}`;
      const storageRef = ref(storage, `6_degree_applications/${fileName}`);

      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return {
          url: downloadURL,
          name: file.name,
          size: file.size,
          type: file.type
        };
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}`);
      }
    });

    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    // Validate general information
    if (!formData.userName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check high school
    if (!formData.schoolAttending || !formData.schoolAttending.trim()) {
      toast.error('Please enter your high school');
      return;
    }

    if (!formData.gradeLevel) {
      toast.error('Please select your grade level');
      return;
    }

    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return;
    }

    if (!formData.areasOfInterest || formData.areasOfInterest.length === 0) {
      toast.error('Please select at least one field of interest');
      return;
    }

    if (!formData.hasCollegeDecision) {
      toast.error('Please indicate if you have decided on a college');
      return;
    }

    if (formData.hasCollegeDecision === 'yes' && !formData.collegeDecision.trim()) {
      toast.error('Please enter the college name');
      return;
    }

    if (!formData.password) {
      toast.error('Please create a password');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate path selection
    if (!selectedPath) {
      toast.error('Please select a path');
      return;
    }

    // Validate path-specific fields
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
      if (uploadedFiles.length === 0) {
        toast.error('Please upload at least one file');
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
      if (uploadedFiles.length === 0) {
        toast.error('Please upload at least one file');
        return;
      }
      if (!interests.trim()) {
        toast.error('Please enter your academic interests');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      toast.loading('Creating your account and submitting application...');

      // 1. Create account and save user profile
      let createdUser;
      await saveSixDegreesOnboarding(
        formData.email,
        formData.password,
        {
          userName: formData.userName,
          highSchool: formData.schoolAttending,
          gradeLevel: formData.gradeLevel?.value || formData.gradeLevel,
          city: formData.city,
          areasOfInterest: formData.areasOfInterest,
          hasCollegeDecision: formData.hasCollegeDecision,
          collegeDecision: formData.collegeDecision,
        },
        (user) => {
          createdUser = user;
        }
      );

      // 2. Upload files to Storage
      let uploadedFileUrls = [];
      if (uploadedFiles.length > 0) {
        try {
          uploadedFileUrls = await uploadFilesToStorage(uploadedFiles, createdUser.uid);
        } catch (error) {
          toast.dismiss();
          toast.error('Failed to upload files. Please try again.');
          // Delete the created user if file upload fails
          if (auth.currentUser) {
            await auth.currentUser.delete();
          }
          setIsSubmitting(false);
          return;
        }
      }

      // 3. Save application to 6_degree_applications
      const applicationData = {
        userId: createdUser.uid,
        userEmail: formData.email,
        userName: formData.userName,
        selectedPath,
        createdAt: serverTimestamp(),
        uploadedFiles: uploadedFileUrls,
        hasNewUploads: uploadedFiles.length > 0,
        hasExistingResume: false,
      };

      if (selectedPath === 'existing') {
        applicationData.selectedMentor = typeof selectedMentor === 'object' ? selectedMentor.label : selectedMentor;
        applicationData.workDescription = workDescription;
        applicationData.mentorInterest = mentorInterest;
        applicationData.existingMaterials = existingMaterials;
        applicationData.interests = interests;
      }

      if (selectedPath === 'new') {
        applicationData.workDescription = workDescription;
        applicationData.interests = interests;
      }

      await addDoc(collection(db, '6_degree_applications'), applicationData);

      // 4. Set localStorage flag for welcome modal
      localStorage.setItem('showSixDegreesWelcome', 'true');

      toast.dismiss();
      toast.success('Account created and application submitted successfully!');

      // 5. Wait for auth state to propagate, then navigate to Home
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // Auth state is ready, navigate to Home
          unsubscribe(); // Clean up the listener
          navigate('/Home');

          // Force page reload after 5 seconds to ensure all data is fresh
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        }
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.dismiss();

      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please log in instead.');
      } else {
        toast.error(error.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="six-degree-onboarding-holder">
      <div className="six-degree-onboarding-container">
        <div className="six-degree-logo-container">
          <img src="/assets/launchpad_logo.png" alt="Launchpad" className="six-degree-logo" />
        </div>

        <div className="six-degree-onboarding-header">
          <h1 className="six-degree-onboarding-title">Six Degrees Mentor Application</h1>
          <p className="six-degree-onboarding-subtitle">
            Connect with world-class mentors for research, projects, and academic pursuits.
          </p>
        </div>

        <div className="six-degree-onboarding-form">
          {/* General Information Section */}
          <div className="six-degree-section">
            <h2 className="six-degree-section-title">General Information<span className="six-degree-required">*</span></h2>

            <div className="six-degree-field">
              <label className="six-degree-label">1. Full Name<span className="six-degree-required">*</span></label>
              <input
                type="text"
                className="six-degree-input"
                placeholder="Enter your full name"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="six-degree-field">
              <label className="six-degree-label">2. Email Address<span className="six-degree-required">*</span></label>
              <input
                type="email"
                className="six-degree-input"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="six-degree-field">
              <label className="six-degree-label">3. What high school do you attend?<span className="six-degree-required">*</span></label>
              <HighSchoolSearch
                selectedOptions={formData}
                handleChange={handleInputChange}
                field="schoolAttending"
                showQuestion={false}
              />
            </div>

            <div className="six-degree-field">
              <label className="six-degree-label">4. Grade Level<span className="six-degree-required">*</span></label>
              <CustomSelect
                options={gradeOptions}
                value={formData.gradeLevel}
                onChange={(value) => handleInputChange('gradeLevel', value)}
                placeholder="Select your grade..."
                isDisabled={isSubmitting}
              />
            </div>

            <div className="six-degree-field">
              <label className="six-degree-label">5. What city do you reside in?<span className="six-degree-required">*</span></label>
              <CitySearch
                selectedOptions={formData}
                handleChange={handleInputChange}
                field="city"
                showQuestion={false}
              />
            </div>

            <div className="six-degree-field">
              <label className="six-degree-label">6. What are you interested in?<span className="six-degree-required">*</span></label>
              <CustomSelect
                options={careerInterests}
                value={formData.areasOfInterest}
                onChange={(value) => handleInputChange('areasOfInterest', value)}
                placeholder="Select your interests..."
                isMulti={true}
                isSearchable={true}
                isDisabled={isSubmitting}
              />
            </div>

            <div className="six-degree-field">
              <label className="six-degree-label">7. Have you decided which college you'll attend?<span className="six-degree-required">*</span></label>
              <div className="six-degree-radio-group">
                <label className="six-degree-radio-option">
                  <input
                    type="radio"
                    name="hasCollegeDecision"
                    value="yes"
                    checked={formData.hasCollegeDecision === 'yes'}
                    onChange={(e) => handleInputChange('hasCollegeDecision', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span className="six-degree-radio-label">Yes, I've committed to a college</span>
                </label>

                <label className="six-degree-radio-option">
                  <input
                    type="radio"
                    name="hasCollegeDecision"
                    value="no"
                    checked={formData.hasCollegeDecision === 'no'}
                    onChange={(e) => {
                      handleInputChange('hasCollegeDecision', e.target.value);
                      handleInputChange('collegeDecision', 'No'); // Set to "No" instead of empty string
                    }}
                    disabled={isSubmitting}
                  />
                  <span className="six-degree-radio-label">No, I haven't decided yet</span>
                </label>
              </div>
            </div>

            {formData.hasCollegeDecision === 'yes' && (
              <div className="six-degree-field">
                <label className="six-degree-label">Which college?<span className="six-degree-required">*</span></label>
                <input
                  type="text"
                  className="six-degree-input"
                  placeholder="Enter the college name"
                  value={formData.collegeDecision}
                  onChange={(e) => handleInputChange('collegeDecision', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Choose Your Path Section */}
          <div className="six-degree-section">
            <h2 className="six-degree-section-title">Choose Your Path<span className="six-degree-required">*</span></h2>
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

              <div className="six-degree-field">
                <label className="six-degree-label">1. Which mentor are you interested in?<span className="six-degree-required">*</span></label>
                <CustomSelect
                  options={mentorOptions}
                  value={selectedMentor}
                  onChange={setSelectedMentor}
                  placeholder="Select a mentor..."
                  isDisabled={isSubmitting}
                />
              </div>

              <div className="six-degree-field">
                <label className="six-degree-label">2. What would you like to work on with this mentor?<span className="six-degree-required">*</span></label>
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

              <div className="six-degree-field">
                <label className="six-degree-label">3. Why are you specifically interested in this mentor?<span className="six-degree-required">*</span></label>
                <textarea
                  className="six-degree-textarea"
                  placeholder="Explain your interest in this mentor..."
                  value={mentorInterest}
                  onChange={(e) => setMentorInterest(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>

              <div className="six-degree-field">
                <label className="six-degree-label">4. What do you already have related to this project?<span className="six-degree-required">*</span></label>
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

              <div className="six-degree-field">
                <label className="six-degree-label">5. Please upload any relevant files here<span className="six-degree-required">*</span></label>
                <p className="six-degree-field-hint">E.g. resume, research abstract, publications</p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isSubmitting}
                  className="six-degree-file-input"
                  multiple
                />
                <p className="six-degree-field-hint" style={{ marginTop: '4px' }}>
                  Max {MAX_TOTAL_FILES} files, {MAX_FILE_SIZE / (1024 * 1024)}MB per file. PDF or Word documents only.
                </p>

                {uploadedFiles.length > 0 && (
                  <div className="six-degree-files-list">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="six-degree-file-item">
                        <div className="six-degree-file-info">
                          <span className="six-degree-file-name">{file.name}</span>
                          <span className="six-degree-file-size">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isSubmitting}
                          className="six-degree-file-remove"
                          aria-label="Remove file"
                        >
                          <IoCloseCircle />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="six-degree-field">
                <label className="six-degree-label">6. Please describe your interest in this field and how you intend to pursue it professionally.<span className="six-degree-required">*</span></label>
                <input
                  type="text"
                  className="six-degree-input"
                  placeholder="Type here..."
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

              <div className="six-degree-field">
                <label className="six-degree-label">1. What do you want to work on?<span className="six-degree-required">*</span></label>
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

              <div className="six-degree-field">
                <label className="six-degree-label">2. Please upload any relevant files here<span className="six-degree-required">*</span></label>
                <p className="six-degree-field-hint">E.g. resume, research abstract, publications</p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isSubmitting}
                  className="six-degree-file-input"
                  multiple
                />
                <p className="six-degree-field-hint" style={{ marginTop: '4px' }}>
                  Max {MAX_TOTAL_FILES} files, {MAX_FILE_SIZE / (1024 * 1024)}MB per file. PDF or Word documents only.
                </p>

                {uploadedFiles.length > 0 && (
                  <div className="six-degree-files-list">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="six-degree-file-item">
                        <div className="six-degree-file-info">
                          <span className="six-degree-file-name">{file.name}</span>
                          <span className="six-degree-file-size">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isSubmitting}
                          className="six-degree-file-remove"
                          aria-label="Remove file"
                        >
                          <IoCloseCircle />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="six-degree-field">
                <label className="six-degree-label">3. Please describe your interest in this field and how you intend to pursue it professionally.<span className="six-degree-required">*</span></label>
                <input
                  type="text"
                  className="six-degree-input"
                  placeholder="Type here..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Opt-in Message Section */}
          {selectedPath && (
            <div className="six-degree-section six-degree-opt-in-section">
              <h2 className="six-degree-section-title">6. Last thing! Please note that, to participate in Launchpad's 6 Degree Mentorship Program, you must first create an account on Launchpad.</h2>
              <p className="six-degree-opt-in-message">
                For context, Launchpad is a broader mentorship platform connecting high schoolers, college students, and professionals that allows you to:
              </p>
              <ul className="six-degree-opt-in-list">
                <li>Connect directly with other users (including access to email contact information)</li>
                <li>Find in-person or online internships, jobs, and volunteer opportunities</li>
                <li>Promote your own initiatives, projects, or ideas to other users</li>
              </ul>

              <div className="six-degree-field">
                <label className="six-degree-label">Create your password here<span className="six-degree-required">*</span></label>
                <div className="six-degree-password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="six-degree-input"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="six-degree-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                {formData.password && (
                  <div className="six-degree-password-requirements">
                    <div className={passwordValidation.errors.minLength ? 'valid' : 'invalid'}>
                      {passwordValidation.errors.minLength ? '✓' : '✗'} At least 8 characters
                    </div>
                    <div className={passwordValidation.errors.hasUpper ? 'valid' : 'invalid'}>
                      {passwordValidation.errors.hasUpper ? '✓' : '✗'} One uppercase letter
                    </div>
                    <div className={passwordValidation.errors.hasLower ? 'valid' : 'invalid'}>
                      {passwordValidation.errors.hasLower ? '✓' : '✗'} One lowercase letter
                    </div>
                    <div className={passwordValidation.errors.hasNumber ? 'valid' : 'invalid'}>
                      {passwordValidation.errors.hasNumber ? '✓' : '✗'} One number
                    </div>
                  </div>
                )}
              </div>

              <div className="six-degree-field">
                <label className="six-degree-label">Confirm password<span className="six-degree-required">*</span></label>
                <div className="six-degree-password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="six-degree-input"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="six-degree-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="six-degree-password-error">Passwords do not match</p>
                )}
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
                {isSubmitting ? 'Submitting...' : 'SIGN UP AND SUBMIT APPLICATION'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SixDegreeOnboardingPage;
