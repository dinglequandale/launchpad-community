import { useState } from 'react';
import './WaitlistPage.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import toast from 'react-hot-toast';
import { IoCheckmarkCircle } from 'react-icons/io5';
import CustomSelect from '../../components/CustomSelect/CustomSelect.jsx';
import { careerInterests } from '../../pages/Onboarding/Options.jsx';

const WaitlistPage = () => {
  const [fullName, setFullName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [interests, setInterests] = useState([]);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const gradeLevels = [
    { value: '9th', label: '9th Grade' },
    { value: '10th', label: '10th Grade' },
    { value: '11th', label: '11th Grade' },
    { value: '12th', label: '12th Grade' },
    { value: 'college_freshman', label: 'College Freshman' },
    { value: 'college_sophomore', label: 'College Sophomore' },
    { value: 'college_junior', label: 'College Junior' },
    { value: 'college_senior', label: 'College Senior' },
    { value: 'graduate_student', label: 'Graduate Student' },
    { value: 'professional', label: 'Professional' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    // Validation
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!gradeLevel) {
      toast.error('Please select your grade level');
      return;
    }

    if (!interests || interests.length === 0) {
      toast.error('Please select at least one area of interest');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading('Joining the waitlist...');

      // Save to Firestore waitlist collection
      await addDoc(collection(db, 'waitlist'), {
        fullName,
        gradeLevel: typeof gradeLevel === 'object' ? gradeLevel.label || gradeLevel.value : gradeLevel,
        interests: interests.map(interest => interest.label || interest),
        email,
        createdAt: serverTimestamp(),
        syncedToSheets: false
      });

      toast.dismiss();
      setShowSuccessModal(true);

      // Reset form after 2.5 seconds
      setTimeout(() => {
        setFullName('');
        setGradeLevel('');
        setInterests([]);
        setEmail('');
        setShowSuccessModal(false);
      }, 2500);

    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.dismiss();
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="waitlist-page-holder">
      <div className="waitlist-page-container">
        <div className="waitlist-logo-container">
          <img src="/assets/launchpad_logo.png" alt="Launchpad" className="waitlist-logo" />
        </div>

        <div className="waitlist-page-header">
          <h1 className="waitlist-page-title">Join the Waitlist</h1>
          <p className="waitlist-page-subtitle">
            Be the first to know when Launchpad launches in your area. Connect with peers, mentors, and opportunities.
          </p>
        </div>

        <div className="waitlist-form">
          <div className="waitlist-field">
            <label className="waitlist-label">Full Name</label>
            <input
              type="text"
              className="waitlist-input"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="waitlist-field">
            <label className="waitlist-label">Grade Level</label>
            <CustomSelect
              options={gradeLevels}
              value={gradeLevel}
              onChange={setGradeLevel}
              placeholder="Select your grade level"
              isDisabled={isSubmitting}
            />
          </div>

          <div className="waitlist-field">
            <label className="waitlist-label">Areas of Interest</label>
            <CustomSelect
              options={careerInterests}
              value={interests}
              onChange={setInterests}
              placeholder="Select your areas of interest..."
              isMulti={true}
              isSearchable={true}
              isDisabled={isSubmitting}
            />
          </div>

          <div className="waitlist-field">
            <label className="waitlist-label">Email</label>
            <input
              type="email"
              className="waitlist-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="waitlist-actions">
            <button
              className="waitlist-btn waitlist-btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="waitlist-success-overlay">
          <div className="waitlist-success-modal">
            <IoCheckmarkCircle size={64} className="waitlist-success-icon" />
            <h2 className="waitlist-success-title">Welcome to the Waitlist!</h2>
            <p className="waitlist-success-message">
              Thank you for joining! We'll notify you at {email} when Launchpad is available in your area.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistPage;
