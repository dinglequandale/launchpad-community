import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { getBasicUserDescription } from './userProfileServices';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { parentInvitationTemplate } from '../utils/parentVerificationTemplates';
import { doCreateUserWithEmailAndPassword } from '../firebase/auth';
// import { updateTypesense } from '../typesense/typesenseClient';

export const saveHighSchooler = async (currentUser, highSchoolerData, onSuccess) => {
    try {
        const { userPfp, userResume, ...otherData } = highSchoolerData;

        const pfpURL = await uploadFileToStorage(userPfp, `pfp_${currentUser.uid}`, 'profile_pictures');
        const resumeURL = await uploadFileToStorage(userResume, `resume_${currentUser.uid}`, 'resumes');

        const dataToSave = {
        ...otherData,
        userPfpPreview: pfpURL,
        userResumePreview: resumeURL,
        userId: currentUser.uid,
        emailNotificationsEnabled: true, // Default to enabled for email notifications
        // COMMUNITY VERSION: Removed parent verification fields
        };

        // COMMUNITY VERSION: Removed tenant-based architecture
        const docRef = await setDoc(doc(db, 'users', currentUser.uid), dataToSave);

        // console.log("High Schooler info saved -- written with ID: ", docRef.id);
        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        // Send parent invitation emails if any emails were provided
        if (highSchoolerData.parentEmails && Array.isArray(highSchoolerData.parentEmails) && highSchoolerData.parentEmails.length > 0) {
            try {
                const sendSESEmail = httpsCallable(getFunctions(), 'sendSESEmail');
                // Filter out empty emails and send to each valid email
                const validEmails = highSchoolerData.parentEmails.filter(email => email && email.trim());

                for (const email of validEmails) {
                    try {
                        await sendSESEmail({
                            recipient: [email],
                            subject: `${highSchoolerData.userName} invited you to join Launchpad`,
                            htmlTemplate: parentInvitationTemplate({
                                studentName: highSchoolerData.userName || 'Your child',
                            }),
                            emailType: "parent_invitation"
                        });
                        console.log('Parent invitation email sent to:', email);
                    } catch (emailError) {
                        console.error('Error sending parent invitation email to', email, ':', emailError);
                        // Continue to next email if one fails
                    }
                }
            } catch (error) {
                console.error('Error in parent invitation email process:', error);
                // Don't fail the onboarding if email fails
            }
        }

        // await updateTypesense('users', currentUser.uid, dataToSave);
        onSuccess();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const saveCollegeStudent = async (currentUser, collegeStudentData, onSuccess) => {

    try {
        const { userPfp, userResume, ...otherData } = collegeStudentData;

        const pfpURL = await uploadFileToStorage(userPfp, `pfp_${currentUser.uid}`, 'profile_pictures');
        const resumeURL = await uploadFileToStorage(userResume, `resume_${currentUser.uid}`, 'resumes');

        const dataToSave = {
        ...otherData,
        userPfpPreview: pfpURL,
        userResumePreview: resumeURL,
        userId: currentUser.uid,
        userSkills: (collegeStudentData.userSkills.length > 0 && collegeStudentData.userSkills[0].skillDescription === "") ? [] : collegeStudentData.userSkills,
        emailNotificationsEnabled: true, // Default to enabled for email notifications
        };

        // COMMUNITY VERSION: Removed tenant-based architecture
        const docRef = await setDoc(doc(db, 'users', currentUser.uid), dataToSave);
        // console.log("College Student info saved -- written with ID: ", docRef.id);
        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        // await updateTypesense('users', currentUser.uid, dataToSave);
        onSuccess();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const saveProfessional = async (currentUser, professionalData, onSuccess) => {

    try {
        // const { userPfp, userResume, ...otherData } = professionalData;
        const { userPfp, ...otherData } = professionalData;

        const pfpURL = await uploadFileToStorage(userPfp, `pfp_${currentUser.uid}`, 'profile_pictures');
        // const resumeURL = await uploadFileToStorage(userResume, `resume_${currentUser.uid}`, 'resumes');

        const dataToSave = {
        ...otherData,
        userPfpPreview: pfpURL,
        // userResumePreview: resumeURL,
        userId: currentUser.uid,
        emailNotificationsEnabled: true // Default to enabled for email notifications
        };

        // COMMUNITY VERSION: Removed tenant-based architecture
        const docRef = await setDoc(doc(db, 'users', currentUser.uid), dataToSave);
        // console.log("Professional info saved -- written with ID: ", docRef.id);

        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        // await updateTypesense('users', currentUser.uid, dataToSave);
        onSuccess();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

// COMMUNITY VERSION: Staff logic preserved but simplified
export const saveStaff = async (currentUser, staffData, onSuccess) => {
    try {
        // COMMUNITY VERSION: Removed tenant-based architecture
        const dataToSave = {
            ...staffData,
            emailNotificationsEnabled: true // Default to enabled for email notifications
        };
        const docRef = await setDoc(doc(db, 'users', currentUser.uid), dataToSave);
        // console.log("Professional info saved -- written with ID: ", docRef.id);

        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        // await updateTypesense('users', currentUser.uid, dataToSave);
        onSuccess();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Six Degrees Application Onboarding - Creates account and minimal profile
export const saveSixDegreesOnboarding = async (email, password, userData, onSuccess) => {
    try {
        // 1. Create Firebase Auth account
        const userCredential = await doCreateUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 2. Calculate graduation year from grade level
        const currentYear = new Date().getFullYear();
        const gradeLevel = parseInt(userData.gradeLevel);
        const graduationYear = currentYear + (13 - gradeLevel);

        // 3. Prepare minimal user data with Six Degrees flag
        const dataToSave = {
            userName: userData.userName,
            email: email,
            userType: "High Schooler",
            schoolAttending: userData.highSchool,
            schoolId: "", // Empty but required for packageBasicUserInfoToLS
            graduationYear: graduationYear,
            city: userData.city,
            sixDegreesApplicant: true, // Flag for tracking
            userId: user.uid,
            emailNotificationsEnabled: true,
            // Fields from onboarding form
            areasOfInterest: userData.areasOfInterest || [],
            // College decision logic
            collegeDecision: userData.hasCollegeDecision === 'yes' ? userData.collegeDecision : "No",
            collegeInterestsOrDecision: userData.hasCollegeDecision === 'yes' ? userData.collegeDecision : [],
            // Empty/default fields for consistency with standard onboarding
            linkedinLink: "",
            parentEmails: [],
            userPfpPreview: null,
            userResumePreview: null,
        };

        // 4. Save to Firestore
        await setDoc(doc(db, 'users', user.uid), dataToSave);

        // 5. Package data to localStorage
        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        // 6. Call success callback
        onSuccess(user);
    } catch (e) {
        console.error("Error in Six Degrees onboarding:", e);
        throw e; // Re-throw to allow component to handle error
    }
};

export const requiredQuestionsAnswered = (questionConfig, userData) => {
    const requiredQuestions = questionConfig.filter((question)=>!question.optional);
    const emptyRequiredQuestions = requiredQuestions.filter((question)=>(userData[question.id] === "" || userData[question.id] === null || (Array.isArray(userData[question.id]) && userData[question.id].length===0) || userData[question.id] === false));
    // console.log("EMPTY STUFF: ", emptyRequiredQuestions);
    return emptyRequiredQuestions.length === 0;
}

const uploadFileToStorage = async (file, fileName, folderName) => {

    if (!file) return null;
  
    const fileExtension = file.name.split('.').pop();
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

export const packageBasicUserInfoToLS = (userData) => {

    const userShortDescription = getBasicUserDescription(userData);

    const currYear = new Date().getFullYear();
    
    const userHighSchoolType = (graduationYear) => {
        if(currYear + 2 >= graduationYear){
            return "Upperclassman";
        }
        else{
            return "Lowerclassman";
        }
    }

    const basicUserInfo = {
        userName: userData.userName,
        userType: userData.userType,
        userPfpPreview: userData.userPfpPreview,
        userShortDescription: userShortDescription,
        userHighSchoolType: (userData.userType === "High Schooler") ? userHighSchoolType(userData.graduationYear) : null,
        userSchoolId: userData.schoolId,
        userSchool: userData.schoolName,
        isCommitted: (userData.userType === "High Schooler") ? !Array.isArray(userData.collegeInterestsOrDecision) : null,
        // COMMUNITY VERSION: Removed parent verification fields
        parentEmails: (userData.userType === "High Schooler") ? userData.parentEmails : null,
    };

    localStorage.setItem("basicUserInfo", JSON.stringify(basicUserInfo));
    // localStorage.removeItem("tempSchoolInfo");
    localStorage.removeItem("tempStudentInfo");
}

export const pushInitialProfileCompletion = (userData) => {
    //TODO: handle
    const currUserData = (!userData.linkedinLink || userData.linkedinLink !== "") ? userData : Object.fromEntries(Object.entries(userData).filter(([k,v]) => k !== "linkedinLink"));
    const emptyQuestions = Object.values(currUserData).filter((answer)=>(answer === "" || answer === null || (Array.isArray(answer) && answer.length===0)));
    const exactPercentage = ((Object.keys(currUserData).length - emptyQuestions.length)/Object.keys(currUserData).length)*100;
    const roundedPercentage = Math.floor(exactPercentage / 10) * 10;
    // console.log(roundedPercentage, emptyQuestions, exactPercentage);
    localStorage.setItem("userProfileProgress", `${roundedPercentage/100}`);
}