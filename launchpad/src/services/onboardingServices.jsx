import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { getBasicUserDescription } from './userProfileServices';
// import { updateTypesense } from '../typesense/typesenseClient';

export const saveHighSchooler = async (currentUser, highSchoolerData, onSuccess) => {
    try {
        const { userPfp, userResume, parentRequested, ...otherData } = highSchoolerData;

        const pfpURL = await uploadFileToStorage(userPfp, `pfp_${currentUser.uid}`, 'profile_pictures');
        const resumeURL = await uploadFileToStorage(userResume, `resume_${currentUser.uid}`, 'resumes');

        const dataToSave = {
        ...otherData,
        userPfpPreview: pfpURL,
        userResumePreview: resumeURL,
        userId: currentUser.uid,
        parentEmail: highSchoolerData.parentEmail,
        parentVerified: false,
        };

        // here, highSchoolerData.schoolId is basically always going to equal 'awty' for now
        const docRef = await setDoc(doc(db, 'tenants', highSchoolerData.schoolId, 'users', currentUser.uid), dataToSave);
        
        // console.log("High Schooler info saved -- written with ID: ", docRef.id);
        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        // JOSE TODO
        // await updateTypesense('users', currentUser.uid, dataToSave, highSchoolerData.schoolId);
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
        };

        const docRef = await setDoc(doc(db, 'tenants', collegeStudentData.schoolId, 'users', currentUser.uid), dataToSave);
        // console.log("College Student info saved -- written with ID: ", docRef.id);
        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        // await updateTypesense('users', currentUser.uid, dataToSave, collegeStudentData.schoolId);
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
        userId: currentUser.uid
        };

        const docRef = await setDoc(doc(db, 'tenants', professionalData.schoolId, 'users', currentUser.uid), dataToSave);
        // console.log("Professional info saved -- written with ID: ", docRef.id);

        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);

        // await updateTypesense('users', currentUser.uid, dataToSave, professionalData.schoolId);
        onSuccess();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const saveStaff = async (currentUser, staffData, onSuccess) => {
    try {
        const docRef = await setDoc(doc(db, 'tenants', staffData.schoolId, 'users', currentUser.uid), staffData);
        // console.log("Professional info saved -- written with ID: ", docRef.id);

        pushInitialProfileCompletion(staffData);
        packageBasicUserInfoToLS(staffData);

        // await updateTypesense('users', currentUser.uid, dataToSave, professionalData.schoolId);
        onSuccess();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export const requiredQuestionsAnswered = (questionConfig, userData) => {
    const requiredQuestions = questionConfig.filter((question)=>!question.optional);
    const emptyRequiredQuestions = requiredQuestions.filter((question)=>(userData[question.id] === "" || userData[question.id] === null || (Array.isArray(userData[question.id]) && userData[question.id].length===0) || userData[question.id] === false));
    console.log("EMPTY STUFF: ", emptyRequiredQuestions);
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
        parentEmail: (userData.userType === "High Schooler") ? userData.parentEmail : null,
        parentVerified: (userData.userType === "High Schooler") ? userData.parentVerified : null,
    };

    localStorage.setItem("basicUserInfo", JSON.stringify(basicUserInfo));
    // localStorage.removeItem("tempSchoolInfo");
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