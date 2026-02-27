import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { packageBasicUserInfoToLS, pushInitialProfileCompletion } from './onboardingServices';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';
import { parentInvitationTemplate } from '../utils/parentVerificationTemplates';

// Track onboarding submissions for analytics
const trackOnboardingSubmission = async (userName) => {
    try {
        const { doc: docFn, getDoc, updateDoc, increment, arrayUnion, setDoc: setDocFn } = await import('firebase/firestore');
        const firstName = userName?.split(' ')[0]?.trim() || 'Unknown';
        const today = new Date().toISOString().split('T')[0];
        const analyticsDocRef = doc(db, 'onboarding_analytics', today);
        const docSnap = await getDoc(analyticsDocRef);

        if (docSnap.exists()) {
            await updateDoc(analyticsDocRef, {
                count: increment(1),
                firstNames: arrayUnion(firstName)
            });
        } else {
            await setDocFn(analyticsDocRef, {
                date: today,
                count: 1,
                firstNames: [firstName]
            });
        }
    } catch (error) {
        console.error('Error tracking onboarding analytics:', error);
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
        return null;
    }
};

export const saveHSFSHighSchooler = async (currentUser, highSchoolerData, onSuccess) => {
    try {
        const { userPfp, userResume, ...otherData } = highSchoolerData;

        const pfpURL = await uploadFileToStorage(userPfp, `pfp_${currentUser.uid}`, 'profile_pictures');
        const resumeURL = await uploadFileToStorage(userResume, `resume_${currentUser.uid}`, 'resumes');

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
            societies: ["hsfs"],
            societyPrimary: "hsfs",
        });

        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        await trackOnboardingSubmission(highSchoolerData.userName);

        onSuccess();
    } catch (e) {
        console.error("Error saving HSFS High Schooler:", e);
    }
};

export const saveHSFSProfessional = async (currentUser, professionalData, onSuccess) => {
    try {
        const { userPfp, ...otherData } = professionalData;

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
    }
};

/**
 * Enrolls an existing Launchpad user into HSFS.
 * Used when someone already has a Launchpad account and joins HSFS via the access code flow.
 * We fetch their existing profile, merge the HSFS-specific finance interests, and write to
 * the society subcollection — no need to re-collect name, pfp, or other existing fields.
 */
export const enrollExistingUserInHSFS = async (currentUser, areasOfInterest) => {
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
