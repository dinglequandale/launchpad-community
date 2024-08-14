import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { getBasicUserDescription } from './userProfileServices';
import { updateTypesense } from '../typesense/typesenseClient';

export const saveHighSchooler = async (currentUser, highSchoolerData, onSuccess) => {
    try {
        const { userPfp, userResume, ...otherData } = highSchoolerData;

        const pfpURL = await uploadFileToStorage(userPfp, `pfp_${currentUser.uid}`, 'profile_pictures');
        const resumeURL = await uploadFileToStorage(userResume, `resume_${currentUser.uid}`, 'resumes');

        const dataToSave = {
        ...otherData,
        userPfpPreview: pfpURL,
        userResumePreview: resumeURL,
        userId: currentUser.uid
        };

        const docRef = await setDoc(doc(db, 'users', currentUser.uid), dataToSave);
        await updateTypesense('users', currentUser.uid, dataToSave);
        // console.log("High Schooler info saved -- written with ID: ", docRef.id);
        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);
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
        userId: currentUser.uid
        };

        const docRef = await setDoc(doc(db, 'users', currentUser.uid), dataToSave);
        await updateTypesense('users', currentUser.uid, dataToSave);
        // console.log("College Student info saved -- written with ID: ", docRef.id);
        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);
        onSuccess();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const saveProfessional = async (currentUser, professionalData, onSuccess) => {

    try {
        const { userPfp, userResume, ...otherData } = professionalData;

        const pfpURL = await uploadFileToStorage(userPfp, `pfp_${currentUser.uid}`, 'profile_pictures');
        const resumeURL = await uploadFileToStorage(userResume, `resume_${currentUser.uid}`, 'resumes');

        const dataToSave = {
        ...otherData,
        userPfpPreview: pfpURL,
        userResumePreview: resumeURL,
        userId: currentUser.uid
        };

        const docRef = await setDoc(doc(db, 'users', currentUser.uid), dataToSave);
        await updateTypesense('users', currentUser.uid, dataToSave);
        // console.log("Professional info saved -- written with ID: ", docRef.id);

        pushInitialProfileCompletion(dataToSave);
        packageBasicUserInfoToLS(dataToSave);
        onSuccess();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const requiredQuestionsAnswered = (questionConfig, userData) => {
    const requiredQuestions = questionConfig.filter((question)=>!question.optional);
    const emptyRequiredQuestions = requiredQuestions.filter((question)=>(userData[question.id] === "" || userData[question.id] === null || (Array.isArray(userData[question.id]) && userData[question.id].length===0)));
    console.log(emptyRequiredQuestions);
    return emptyRequiredQuestions.length === 0;
}

const uploadFileToStorage = async (file, fileName, folderName) => {

    if (!file) return null;
  
    const fileExtension = file.name.split('.').pop();
    const storageRef = ref(storage, `${folderName}/${fileName}.${fileExtension}`);
  
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

    // Check whether user is upperclassman or lowerclassman
    const currYear = new Date().getFullYear();
    
    const userHighSchoolType = (graduationYear) => {
        if(currYear + 2 >= graduationYear){
            return "Upperclassman"
        }
        else{
            return "Lowerclassman"
        }
    }

    const basicUserInfo = {
        userName: userData.userName,
        userType: userData.userType,
        userPfpPreview: userData.userPfpPreview,
        userShortDescription: userShortDescription,
        userHighSchoolType: (userData.userType === "High Schooler") ? userHighSchoolType(userData.graduationYear) : null
    };

    localStorage.setItem("basicUserInfo", JSON.stringify(basicUserInfo));
}

const pushInitialProfileCompletion = (userData) => {
    const emptyQuestions = Object.values(userData).filter((answer)=>(answer === "" || answer === null || (Array.isArray(answer) && answer.length===0)));
    const exactPercentage = ((Object.keys(userData).length - emptyQuestions.length)/Object.keys(userData).length)*100;
    const roundedPercentage = Math.ceil(exactPercentage / 10) * 10;
    console.log(roundedPercentage, emptyQuestions, exactPercentage);
    localStorage.setItem("userProfileProgress", `${roundedPercentage/100}`);
}