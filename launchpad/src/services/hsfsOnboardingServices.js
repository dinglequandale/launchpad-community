import { doc, setDoc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { packageBasicUserInfoToLS, pushInitialProfileCompletion } from './onboardingServices';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';
import { parentInvitationTemplate } from '../utils/parentVerificationTemplates';

export const HSFS_ACCESS_CODE_KEY = 'societyAccessCode:hsfs';

/**
 * Consume the HSFS access code (entered on /hsfs-access) on the server. Firestore
 * rules only let a user add 'hsfs' to their profile after this succeeds.
 */
export const redeemHSFSAccessCode = async () => {
    const code = sessionStorage.getItem(HSFS_ACCESS_CODE_KEY);
    if (!code) {
        throw new Error('Your HSFS access code has expired. Please enter it again.');
    }
    const redeem = httpsCallable(getFunctions(), 'redeemSocietyAccessCode');
    await redeem({ societyId: 'hsfs', code });
    sessionStorage.removeItem(HSFS_ACCESS_CODE_KEY);
};

// Track onboarding submissions for analytics
const trackOnboardingSubmission = async (userName) => {
    try {
        const firstName = userName?.split(' ')[0]?.trim() || 'Unknown';
        const today = new Date().toISOString().split('T')[0];
        const analyticsDocRef = doc(db, 'onboarding_analytics', today);

        // Single merge-write: no read needed (clients cannot read analytics), and
        // increment/arrayUnion make it safe under concurrent sign-ups.
        await setDoc(analyticsDocRef, {
            date: today,
            count: increment(1),
            firstNames: arrayUnion(firstName)
        }, { merge: true });
    } catch (error) {
        console.error('Error tracking onboarding analytics:', error);
        // Don't throw - we don't want analytics to break onboarding
    }
};

const uploadFileToStorage = async (file, fileName, folderName) => {
    if (!file) return null;
    const storageRef = ref(storage, `${folderName}/${fileName}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error(`Error uploading ${folderName}:`, error);
        throw error;
    }
};

export const saveHSFSHighSchooler = async (currentUser, highSchoolerData, onSuccess) => {
    try {
        const { userPfp, userResume, ...otherData } = highSchoolerData;

        await redeemHSFSAccessCode();

        const pfpURL = await uploadFileToStorage(userPfp, `pfp_${currentUser.uid}`, 'profile_pictures');
        const resumeURL = await uploadFileToStorage(userResume, `resume_${currentUser.uid}.pdf`, 'resumes');

        const dataToSave = {
            ...otherData,
            userPfpPreview: pfpURL,
            userResumePreview: resumeURL,
            userId: currentUser.uid,
            emailNotificationsEnabled: true,
            openToCrossSchoolConnections: 'yes',
            societies: ["hsfs"],
            societyPrimary: "hsfs",
        };

        // Write full data to society subcollection
        await setDoc(doc(db, 'societies', 'hsfs', 'users', currentUser.uid), dataToSave);

        // Write minimal reference to main users collection (needed for auth/app flow)
        await setDoc(doc(db, 'users', currentUser.uid), {
            userId: currentUser.uid,
            userName: highSchoolerData.userName,
            userType: "High Schooler",
            userPfpPreview: pfpURL,
            // Notification functions read the email from the root user doc.
            email: otherData.email || currentUser.email || null,
            emailNotificationsEnabled: true,
            // Home treats a High Schooler without this preference as a pre-existing
            // ("Welcome back!") account; new members start open to all schools.
            openToCrossSchoolConnections: 'yes',
            societies: ["hsfs"],
            societyPrimary: "hsfs",
        });

        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);
        // Same first-run welcome as regular onboarding ("Welcome to Launchpad!").
        localStorage.setItem('showHSWelcomeModal', 'true');

        await trackOnboardingSubmission(highSchoolerData.userName);

        onSuccess();
    } catch (e) {
        console.error("Error saving HSFS High Schooler:", e);
        throw e;
    }
};

export const saveHSFSProfessional = async (currentUser, professionalData, onSuccess) => {
    try {
        const { userPfp, ...otherData } = professionalData;

        await redeemHSFSAccessCode();

        const pfpURL = await uploadFileToStorage(userPfp, `pfp_${currentUser.uid}`, 'profile_pictures');

        const dataToSave = {
            ...otherData,
            userPfpPreview: pfpURL,
            userId: currentUser.uid,
            emailNotificationsEnabled: true,
            societies: ["hsfs"],
            societyPrimary: "hsfs",
            // Map HSFS-specific biography field to the standard userAboutMe field
            // so it renders correctly in the profile's About Me section.
            userAboutMe: otherData.biography || "",
        };

        // Write full data to society subcollection
        await setDoc(doc(db, 'societies', 'hsfs', 'users', currentUser.uid), dataToSave);

        // Write minimal reference to main users collection (needed for auth/app flow)
        await setDoc(doc(db, 'users', currentUser.uid), {
            userId: currentUser.uid,
            userName: professionalData.userName,
            userType: "Professional",
            userPfpPreview: pfpURL,
            // Notification functions read the email from the root user doc.
            email: otherData.email || currentUser.email || null,
            emailNotificationsEnabled: true,
            societies: ["hsfs"],
            societyPrimary: "hsfs",
        });

        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        // Send invitation emails if any emails were provided
        if (professionalData.professionalEmails && Array.isArray(professionalData.professionalEmails) && professionalData.professionalEmails.length > 0) {
            try {
                const sendSESEmail = httpsCallable(getFunctions(), 'sendSESEmail');
                const validEmails = professionalData.professionalEmails.filter(email => email && email.trim());
                const emailSubject = `${professionalData.userName} invited you to join HSFS on Launchpad!`;

                for (const email of validEmails) {
                    try {
                        await sendSESEmail({
                            recipient: [email],
                            subject: emailSubject,
                            htmlTemplate: parentInvitationTemplate({
                                studentName: professionalData.userName || 'An HSFS member',
                                schoolName: 'Houston Finance Society',
                            }),
                            emailType: "invitation"
                        });
                    } catch (emailError) {
                        console.error('Error sending invitation email to', email, ':', emailError);
                    }
                }
            } catch (error) {
                console.error('Error in invitation email process:', error);
            }
        }

        await trackOnboardingSubmission(professionalData.userName);

        onSuccess();
    } catch (e) {
        console.error("Error saving HSFS Professional:", e);
        throw e;
    }
};

/**
 * Enrolls an existing Launchpad user into HSFS.
 * Used when someone already has a Launchpad account and joins HSFS via the access code flow.
 * We fetch their existing profile, merge the HSFS-specific finance interests, and write to
 * the society subcollection — no need to re-collect name, pfp, or other existing fields.
 */
export const enrollExistingUserInHSFS = async (currentUser, areasOfInterest) => {
    await redeemHSFSAccessCode();

    // Fetch their existing Launchpad profile
    const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
    const existingData = userSnap.exists() ? userSnap.data() : {};

    const hsfsData = {
        ...existingData,
        areasOfInterest,
        societies: ['hsfs'],
        societyPrimary: 'hsfs',
        userId: currentUser.uid,
        // Map to standard userAboutMe if a biography field happens to exist
        ...(existingData.biography && !existingData.userAboutMe
            ? { userAboutMe: existingData.biography }
            : {}),
    };

    // Write full enriched data to the society subcollection
    await setDoc(doc(db, 'societies', 'hsfs', 'users', currentUser.uid), hsfsData);

    // Update the main users doc to mark society membership
    await updateDoc(doc(db, 'users', currentUser.uid), {
        societies: ['hsfs'],
        societyPrimary: 'hsfs',
    });

    // Refresh localStorage so the rest of the app sees the updated profile
    packageBasicUserInfoToLS(hsfsData);
    pushInitialProfileCompletion(hsfsData);
};
