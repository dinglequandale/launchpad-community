import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const lowerAndCapitalize = (title) => {
    const lowerTitle = title.toLowerCase();
    const titleList = lowerTitle.split(" ");
    for (let i = 0; i < titleList.length; i++) {
        titleList[i] = titleList[i][0].toUpperCase() + titleList[i].substr(1);
    }
    
    return titleList.join(" ");
}

export const displayFieldsOfInterest = (fieldsOfInterest) => {  
    if(fieldsOfInterest.length < 3){
        const currentList = fieldsOfInterest;
        if(currentList.length !== 1){currentList[currentList.length-1] = ` ${currentList[currentList.length-1]}`}
        return currentList;
    }
    const currentList = fieldsOfInterest.slice(0,2);
    currentList[-1] = ` ${currentList[-1]}`;
    return currentList;
}

export const editUserData = async (userData, currentUser) => {
    try{
      const userRef = doc(db, "users", currentUser.uid);
  
      await updateDoc(userRef, userData);
    }catch(error){console.log(error)};
  }

export const loadUserData = async (currentUser, setLoading, setUserData) => {
    let unsubscribe;
    setLoading(true);

    // setUserBasicInfo(JSON.parse(localStorage.getItem("basicUserInfo")));

    if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUserData(doc.data());
                console.log("Yo we up in here")
            } else {
                console.log("No such document!");
                setUserData(null);
            }
        });
    } else {
        setUserData(null);
    }
    setLoading(false);

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
}

const loadUserResumePreview = async (userData, userResumePreview, currentUser) => {
    const newData = {...userData, userResumePreview};
    await editUserData(newData, currentUser);
}

export const handleUserResumeUpdate = async (userData, resumeFile, currentUser) => {
    const resumeRef = ref(storage, `resumes/resume_${currentUser.uid}.pdf`);

    try {
        const snapshot = await uploadBytes(resumeRef, resumeFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await loadUserResumePreview(userData, downloadURL, currentUser);

        return downloadURL;
    } catch (error) {
      console.error(`Error uploading ${folderName}:`, error);
      return null;
    }
}