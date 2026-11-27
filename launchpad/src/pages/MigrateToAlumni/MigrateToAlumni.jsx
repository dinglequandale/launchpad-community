import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { highSchools, careerInterests, graduationYears } from '../Onboarding/Options';
import OnboardingDropdown from '../../components/OnboardingDropdown/OnboardingDropdown';
import { BiPlus, BiTrash } from 'react-icons/bi';
import toast from 'react-hot-toast';
import './MigrateToAlumni.css';
import Loading from '../../components/LoadingAnimation/Loading';

const sendSESEmail = httpsCallable(getFunctions(), 'sendSESEmail');

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const MigrateToAlumni = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [migrating, setMigrating] = useState(false);
    const [userData, setUserData] = useState(null);
    const [migrationToken, setMigrationToken] = useState(null);
    const [isValidToken, setIsValidToken] = useState(false);
    const [transitionType, setTransitionType] = useState('hs_to_college');
    const isToProfessional = transitionType === 'college_to_professional';
    
    // Alumni-specific form data
    const [alumniData, setAlumniData] = useState({
        collegeAttending: '',
        userSkills: [],
        networkingLevel: []
    });

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        
        if (!token || !userId) {
            toast.error('Invalid migration link');
            navigate('/Home');
            return;
        }

        // This page is public (linked from email), but the migration edits the
        // signed-in user's profile: require sign-in and the matching account.
        if (!currentUser) {
            sessionStorage.setItem('intendedDestination', `${window.location.pathname}${window.location.search}`);
            toast('Please log in to update your account.');
            navigate('/Login');
            return;
        }
        if (currentUser.uid !== userId) {
            toast.error('This link belongs to a different account. Please log in with the account it was sent to.');
            navigate('/Home');
            return;
        }

        setMigrationToken(token);
        loadUserDataAndValidateToken(userId, token);
    }, [searchParams, navigate, currentUser]);

    const loadUserDataAndValidateToken = async (userId, token) => {
        try {
            setLoading(true);
            
            // Validate migration token
            const tokenDoc = await getDoc(doc(db, 'migration_tokens', token));
            if (!tokenDoc.exists()) {
                toast.error('Invalid or expired migration token');
                navigate('/Home');
                return;
            }

            const tokenData = tokenDoc.data();
            const expiresAt = typeof tokenData.expiresAt?.toDate === 'function'
                ? tokenData.expiresAt.toDate()
                : new Date(tokenData.expiresAt);
            if (tokenData.used || !(expiresAt > new Date())) {
                toast.error('Migration token has expired or already been used');
                navigate('/Home');
                return;
            }

            if (tokenData.userId !== userId) {
                toast.error('Invalid migration token for this user');
                navigate('/Home');
                return;
            }

            setIsValidToken(true);
            setTransitionType(tokenData.transitionType || 'hs_to_college');

            // COMMUNITY VERSION: Load user data from flat collection
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (!userDoc.exists()) {
                toast.error('User data not found');
                navigate('/Home');
                return;
            }

            const user = userDoc.data();
            setUserData(user);

            // Pre-populate alumni data with existing high schooler data
            setAlumniData({
                collegeAttending: user.collegeAttending || '',
                userSkills: user.userSkills || [],
                networkingLevel: user.networkingLevel || []
            });

        } catch (error) {
            console.error('Error loading user data:', error);
            toast.error('Error loading user data');
            navigate('/Home');
        } finally {
            setLoading(false);
        }
    };

    const handleSkillChange = (index, field, value) => {
        setAlumniData(prev => ({
            ...prev,
            userSkills: prev.userSkills.map((skill, i) => 
                i === index ? { ...skill, [field]: value } : skill
            )
        }));
    };

    const addSkill = () => {
        setAlumniData(prev => ({
            ...prev,
            userSkills: [...prev.userSkills, { skillCategory: '', skillDescription: '' }]
        }));
    };

    const removeSkill = (index) => {
        setAlumniData(prev => ({
            ...prev,
            userSkills: prev.userSkills.filter((_, i) => i !== index)
        }));
    };

    const handleNetworkingLevelChange = (value) => {
        setAlumniData(prev => ({
            ...prev,
            networkingLevel: prev.networkingLevel.includes(value)
                ? prev.networkingLevel.filter(option => option !== value)
                : [...prev.networkingLevel, value]
        }));
    };

    const handleMigration = async () => {
        if (!userData || !migrationToken) return;

        try {
            setMigrating(true);

            // COMMUNITY VERSION: Update user data in flat collection
            const userRef = doc(db, 'users', currentUser.uid);
            // Graduating college students become Professionals; high schoolers become
            // College Students. (Previously everyone was set to 'College Student'.)
            await updateDoc(userRef, {
                userType: isToProfessional ? 'Professional' : 'College Student',
                ...(isToProfessional ? {} : { collegeAttending: alumniData.collegeAttending }),
                userSkills: alumniData.userSkills,
                networkingLevel: alumniData.networkingLevel,
                migratedAt: new Date(),
                migratedFrom: isToProfessional ? 'College Student' : 'High Schooler'
            });

            // Mark migration token as used
            await updateDoc(doc(db, 'migration_tokens', migrationToken), {
                used: true,
                usedAt: new Date()
            });

            // Send success email
            const successEmailTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Welcome to the Alumni Network!</title>
                </head>
                <body>
                    <h1>🎉 Your Launchpad account has been updated!</h1>
                    <p>Dear ${escapeHtml(userData.userName)},</p>
                    <p>Congratulations! Your account is now set up as a ${isToProfessional ? 'Professional' : 'College Student'} on Launchpad.</p>
                    <p>You now have access to all alumni features and can start connecting with fellow graduates and mentoring current students.</p>
                    <p>Best regards,<br>The Launchpad Team</p>
                </body>
                </html>
            `;

            await sendSESEmail({
                recipient: [userData.email || currentUser.email],
                subject: 'Your Launchpad account has been updated!',
                htmlTemplate: successEmailTemplate,
                emailType: 'migration_success'
            });

            toast.success('Your account has been updated!');
            navigate('/Home');

        } catch (error) {
            console.error('Error during migration:', error);
            toast.error('Error during migration. Please try again.');
        } finally {
            setMigrating(false);
        }
    };

    if (loading) {
        return (
            <div className="migration-container">
                <div className="loading-spinner">
                    <Loading size={40} />
                    <p>Loading migration data...</p>
                </div>
            </div>
        );
    }

    if (!isValidToken || !userData) {
        return (
            <div className="migration-container">
                <div className="error-message">
                    <h2>Invalid Migration Link</h2>
                    <p>This migration link is invalid or has expired.</p>
                    <button onClick={() => navigate('/Home')} className="btn-primary">
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="migration-container">
            <div className="migration-header">
                <h1>🎓 Congratulations, graduate!</h1>
                <p>{isToProfessional
                    ? 'Update your account from College Student to Professional to keep networking on Launchpad.'
                    : 'Update your account from High Schooler to College Student to unlock new networking opportunities.'}</p>
            </div>

            <div className="migration-form">
                <div className="form-section">
                    <h2>Your Information</h2>
                    <div className="user-info">
                        <p><strong>Name:</strong> {userData.userName}</p>
                        <p><strong>School:</strong> {userData.schoolAttending}</p>
                        <p><strong>Graduation Year:</strong> {userData.graduationYear}</p>
                    </div>
                </div>

                {!isToProfessional && (
                <div className="form-section">
                    <h2>College Information</h2>
                    <div className="form-group">
                        <label className="form-label" htmlFor="migrate-college">What college do you go to?</label>
                        {/* Previously a CustomSelect with an empty options list, so no college could be chosen. */}
                        <input
                            id="migrate-college"
                            type="text"
                            className="form-input"
                            maxLength={200}
                            value={alumniData.collegeAttending}
                            onChange={(e) => setAlumniData(prev => ({ ...prev, collegeAttending: e.target.value }))}
                            placeholder="e.g. The University of Texas at Austin"
                        />
                    </div>
                </div>
                )}

                <div className="form-section">
                    <h2>Your Skills</h2>
                    <p className="form-description">
                        List skills that make you stand out to professionals and help you mentor current students.
                    </p>
                    
                    <div className="skills-container">
                        {alumniData.userSkills.map((skill, index) => (
                            <div key={index} className="skill-item">
                                <div className="skill-header">
                                    <h3>Skill {index + 1}</h3>
                                    {index > 0 && (
                                        <button 
                                            className="remove-skill-btn" 
                                            onClick={() => removeSkill(index)}
                                        >
                                            <BiTrash size={18} />
                                        </button>
                                    )}
                                </div>
                                <div className="skill-inputs">
                                    <input
                                        type="text"
                                        placeholder="Skill category (e.g., Programming, Marketing)"
                                        value={skill.skillCategory}
                                        onChange={(e) => handleSkillChange(index, 'skillCategory', e.target.value)}
                                        className="form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Brief description"
                                        value={skill.skillDescription}
                                        onChange={(e) => handleSkillChange(index, 'skillDescription', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="add-skill-btn" onClick={addSkill}>
                        <BiPlus size={18} /> Add Skill
                    </button>
                </div>

                <div className="form-section">
                    <h2>Mentorship Commitment</h2>
                    <p className="form-description">
                        How would you like to help current students? (Optional)
                    </p>
                    
                    <div className="networking-options">
                        {[
                            { id: "casualConnection", value: "Casual Connection", text: "Occasional messages and casual networking regarding your career field" },
                            { id: "generalInquiries", value: "General Inquiries", text: "Entertain student inquiries about opportunities in your field" },
                            { id: "informationalInterview", value: "Informational Interview", text: "Interview with students to discuss your career path" },
                            { id: "resumeReview", value: "Resume Review", text: "Review student resumes and provide feedback" }
                        ].map(option => (
                            <label key={option.id} className="networking-option">
                                <input
                                    type="checkbox"
                                    checked={alumniData.networkingLevel.includes(option.value)}
                                    onChange={() => handleNetworkingLevelChange(option.value)}
                                />
                                <div className="option-content">
                                    <span className="option-title">{option.value}:</span>
                                    <span className="option-description">{option.text}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="migration-actions">
                    <button 
                        className="btn-primary migrate-btn"
                        onClick={handleMigration}
                        disabled={migrating}
                    >
                        {migrating ? 'Updating...' : 'Complete Account Update'}
                    </button>
                    <button 
                        className="btn-secondary"
                        onClick={() => navigate('/Home')}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MigrateToAlumni;
