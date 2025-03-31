import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateTypesense } from '../typesense/typesenseClient';
import { pushInitialProfileCompletion } from "./onboardingServices";
import { SiNamesilo } from "react-icons/si";

export const lowerAndCapitalize = (title) => {
    const lowerTitle = title.toLowerCase();
    const titleList = lowerTitle.split(" ");
    for (let i = 0; i < titleList.length; i++) {
        titleList[i] = titleList[i][0].toUpperCase() + titleList[i].substr(1);
    }
    
    return titleList.join(" ");
}

export const displayShortenedName = (userName) => {
    let firstLast;
    try{
        firstLast = userName.split(" ");
        if(firstLast[1].length < 10){ return (firstLast[0] + " " + firstLast[1]); }
        return firstLast[0] + " " + firstLast[1][0] + ".";}
    catch{
    }
    return userName;
}

export const displayShortenedLinkedin = (linkedInLink) => {
    if(linkedInLink.length > 50) {
        return linkedInLink.substring(0,50);
    }
    else{
        return linkedInLink;
    }
}

export const displayFieldsOfInterest = (fieldsOfInterest, length = "shorter") => {
    const abbreviations = {
        "Mathematics": "Math",
        "Business Management": "Business",
        "Business (Operations)": "Business",
        "Business (Sales)": "Business",
        "Business (Administration)": "Business",
        "Computer Science": "CS",
        "Medicine": "Med",
        "Economics": "Econ",
        "Data Science & Analysis": "Data Science",
        "Marketing & Advertising": "Marketing",
        "Environmental Science": "Env. Science",
        "Artificial Intelligence": "AI",
        "Information Technology": "IT",
        "Public & Government Policy Administration / Politics": "Public Policy",
        "Political Science": "Poli Sci",
        "Athletics & Fitness": "Athletics",
        "International Relations": "Int'l Relations",
        "Communications Study": "Communications",
        "Journalism & Writing": "Journalism",
        "Visual Arts": "Art",
        "Performing Arts": "Performance",
        "Human Resources": "HR",
        "Criminal Justice": "Crim Justice",
        "Film Studies": "Film",
        "Marine Science": "Marine Sci",
        "Hospitality Management": "Hospitality",
        "Life, Animal, & Earth Science": "Life Sciences",
        "Hands-On Building Trades (Carpentry, Welding, Plumbing, and Construction)": "Building Trades",
        "Hands-On Mechanical & Technical Trades": "Mechanical Trades",
        "Hands-On Maintenance & Event Organization": "Maintenance & Events",
        "Education (Teaching, Administration, Counseling)": "Education",
        "Social Work (Social Services, Counseling)": "Social Work"
    };

    const shortenFieldName = (field) => {
        return abbreviations[field] || field;
    };

    const listLength = length === "shorter" ? 2 : fieldsOfInterest.length;
    const currentList = (length === "shorter") ? fieldsOfInterest.slice(0, listLength).map(shortenFieldName) : fieldsOfInterest.slice(0, listLength);

    if (currentList.length === 1) {
        return currentList[0];
    }

    if (currentList.length === 2) {
        return currentList.join(" and ");
    }

    return currentList.slice(0, -1).join(", ") + ", and " + currentList.slice(-1);
};

export const displayColleges = (colleges, length = "longer") => {
    const abbreviations = {
        "University of Pennsylvania": "UPenn",
        "Massachusetts Institute of Technology": "MIT",
        "California Institute of Technology": "Caltech",
        "Georgia Institute of Technology": "Georgia Tech",
        "Carnegie Mellon University": "Carnegie Mellon",
        "Johns Hopkins University": "Johns Hopkins",
        "University of California, Los Angeles": "UCLA",
        "University of California, Berkeley": "UC Berkeley",
        "University of Southern California": "USC",
        "New York University": "NYU",
        "University of Chicago": "UChicago",
        "University of Michigan Ann Arbor": "UMich",
        "University of Wisconsin-Madison": "UW-Madison",
        "University of North Carolina at Chapel Hill": "UNC Chapel Hill",
        "The University of Texas at Austin": "UT Austin",
        "Virginia Polytechnic Institute and State University": "Virginia Tech",
        "Pennsylvania State University": "Penn State",
        "Purdue University": "Purdue",
        "Northwestern University": "Northwestern",
        "Boston University": "BU",
        "University of California, San Diego": "UCSD",
        "University of Washington": "UW",
        "Ohio State University": "OSU",
        "University of Florida": "UF",
        "University of Virginia": "UVA",
        "University of Notre Dame": "Notre Dame",
        "Georgetown University": "Georgetown",
        "Dartmouth College": "Dartmouth",
        "Duke University": "Duke",
        "Vanderbilt University": "Vanderbilt",
        "Washington University in St. Louis": "WashU",
        "Washington University": "WashU",
        "Emory University": "Emory",
        "Tufts University": "Tufts",
    };

    const shortenCollegeName = (name) => {
        // Check for known abbreviations
        if (abbreviations[name]) return abbreviations[name];

        // Remove common suffixes
        name = name.replace(/(University|College|Institute of Technology|The University of)/gi, "").trim();
        return name;
    };

    const listLength = length === "shorter" ? 2 : colleges.length;
    const currentList = colleges.slice(0, listLength).map(shortenCollegeName);

    if (currentList.length === 1) {
        return currentList[0];
    }

    if (currentList.length === 2) {
        return currentList.join(" and ");
    }

    return currentList.slice(0, -1).join(", ") + ", " + currentList.slice(-1);
};

const getUserHS = (schoolName) => {
    const hsAbbreviations = {
        "Awty International School":"Awty"
    }

    if(hsAbbreviations[schoolName]) return hsAbbreviations[schoolName];
    const baseSchoolName = schoolName.replace(/(School|High School)$/i, "").trim();
    return baseSchoolName + " H.S."
}


export const getBasicUserDescription = (userData, shortened=true) => {
    return userData.userType === "High Schooler" ?
     `Class of ${userData.graduationYear}, ${getUserHS(userData.schoolAttending)}` 
     : userData.userType === "Alumni" ? `Graduated in ${userData.graduationYear}, ${getUserHS(userData.schoolAttending)}` 
     : `${userData.yearsOfExperience}+ Years of Experience in ${shortened ? userData.areasOfInterest[0] 
        : displayFieldsOfInterest(userData.areasOfInterest)}`;
}

export const editUserData = async (newData, currentUser, origUserData) => {
    try{
        const userRef = doc(db, "tenants", localStorage.getItem("schoolId"), "users", currentUser.uid);
    
        await updateDoc(userRef, newData);
        pushInitialProfileCompletion({... origUserData, ...newData});

        await updateTypesense('users', currentUser.uid, {... origUserData, ...newData}, localStorage.getItem("schoolId"));
    }catch(error){console.log(error)};
}

export const loadUserData = async (currentUser, setLoading, setUserData) => {
    let unsubscribe;
    setLoading(true);

    if (currentUser) {
        const userDocRef = doc(db, "tenants", localStorage.getItem("schoolId"), 'users', currentUser.uid);
        unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUserData(doc.data());
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

const loadUserPfpPreview = async (userData, userPfpPreview, currentUser, privacy) => {
    const newData = {userPfpPreview: `${privacy === "private" ? "private " : ""}` + userPfpPreview};
    await editUserData(newData, currentUser, userData);
}

const loadUserResumePreview = async (userData, userResumePreview, currentUser) => {
    const newData = {userResumePreview: userResumePreview};
    await editUserData(newData, currentUser, userData);
}

export const handleUserResumeUpdate = async (userData, resumeFile, currentUser, privacy = "") => {
    const resumeRef = ref(storage, `resumes/resume_${currentUser.uid}.pdf`);

    try {
        const snapshot = await uploadBytes(resumeRef, resumeFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await loadUserResumePreview(userData, downloadURL, currentUser, privacy);

        return downloadURL;
    } catch (error) {
      console.error(`Error uploading ${folderName}:`, error);
      return null;
    }
}

export const handleUserProfileUpdate = async (userData, pfpFile, currentUser) => {
    const pfpRef = ref(storage, `profile_pictures/pfp_${currentUser.uid}`);

    try {
        const snapshot = await uploadBytes(pfpRef, pfpFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await loadUserPfpPreview(userData, downloadURL, currentUser);
        updateLocalPfpPreview(downloadURL);
        return downloadURL;
    } catch (error) {
      console.error(`Error uploading ${folderName}:`, error);
      return null;
    }
}

export const deletePfp = async (userData, currentUser) => {
    const pfpRef = ref(storage, `profile_pictures/pfp_${currentUser.uid}`);

    // Delete the file
    deleteObject(pfpRef).then(() => {
    }).catch((error) => {
        console.log("Error!")
    });
    try{
        await loadUserPfpPreview(userData, "", currentUser);
        updateLocalPfpPreview(null);
    }
    catch{
        console.log("Error!");
    }
}

const updateLocalPfpPreview = (newPfp) => {
    const oldBasicInfo = JSON.parse(localStorage.getItem("basicUserInfo"));
    const newBasicInfo = {...oldBasicInfo, userPfpPreview: newPfp};
    
    localStorage.setItem("basicUserInfo", JSON.stringify(newBasicInfo));
}