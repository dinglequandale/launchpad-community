import { doc, onSnapshot, updateDoc, setDoc, deleteDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
// import { updateTypesense } from '../typesense/typesenseClient';
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
    try {
        const nameParts = userName.split(" ");
        if (nameParts.length === 0) return userName;
        if (nameParts.length === 1) return userName;

        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1]; // Get the actual last name

        if (lastName.length < 10) {
            return `${firstName} ${lastName}`;
        }
        return `${firstName} ${lastName[0]}.`;
    } catch {
        return userName;
    }
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
    // Handle null/undefined cases
    if (!fieldsOfInterest || !Array.isArray(fieldsOfInterest) || fieldsOfInterest.length === 0) {
        return "Not specified";
    }
    
    // Filter out any undefined/null values
    const validFields = fieldsOfInterest.filter(field => field && typeof field === 'string');
    
    if (validFields.length === 0) {
        return "Not specified";
    }
    
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

    const listLength = length === "shorter" ? 2 : validFields.length;
    const currentList = (length === "shorter") ? validFields.slice(0, listLength).map(shortenFieldName) : validFields.slice(0, listLength);

    if (currentList.length === 1) {
        return currentList[0];
    }

    if (currentList.length === 2) {
        return currentList.join(" and ");
    }

    return currentList.slice(0, -1).join(", ") + ", and " + currentList.slice(-1);
};

export const displayColleges = (colleges, length = "longer") => {
    // Handle null/undefined cases
    if (!colleges || !Array.isArray(colleges) || colleges.length === 0) {
        return "Not specified";
    }
    
    // Filter out any undefined/null values
    const validColleges = colleges.filter(college => college && typeof college === 'string');
    
    if (validColleges.length === 0) {
        return "Not specified";
    }
    
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

    const listLength = length === "shorter" ? 2 : validColleges.length;
    const currentList = validColleges.slice(0, listLength).map(shortenCollegeName);

    if (currentList.length === 1) {
        return currentList[0];
    }

    if (currentList.length === 2) {
        return currentList.join(" and ");
    }

    return currentList.slice(0, -1).join(", ") + ", " + currentList.slice(-1);
};

export const getUserHS = (schoolName) => {
    if (!schoolName || typeof schoolName !== 'string') {
        return 'Unknown School';
    }
    
    const hsAbbreviations = {
        "Awty International School":"Awty"
    }

    if(hsAbbreviations[schoolName]) return hsAbbreviations[schoolName];
    const baseSchoolName = schoolName.replace(/(School|High School)$/i, "").trim();
    return baseSchoolName + " H.S."
}

export const displaySchools = (schools) => {
    if(typeof schools === "string"){
        return getUserHS(schools);
    }

    const currentList = schools.map(getUserHS);

    if (currentList.length === 1) {
        return currentList[0];
    }

    if (currentList.length === 2) {
        return currentList.join(" and ");
    }

    return currentList.slice(0, -1).join(", ") + ", " + currentList.slice(-1);
};


export const getBasicUserDescription = (userData, shortened=true) => {
    return userData.userType === "High Schooler" ?
     `Class of ${userData.graduationYear || 'N/A'}, ${getUserHS(userData.schoolAttending || 'Unknown School')}`
     : userData.userType === "College Student" ? `${userData.collegeAttending || 'College Student'}, Class of ${userData.graduationYear || 'N/A'}`
     : userData.userType === "Professional" ? `${userData.yearsOfExperience || 'N/A'}+ Years of Experience in ${shortened ? (userData.areasOfInterest && userData.areasOfInterest.length > 0 ? userData.areasOfInterest[0] : 'General Field')
        : displayFieldsOfInterest(userData.areasOfInterest || [])}`
    : `${userData.schoolRole || 'Staff Member'}`;
}

export const editUserData = async (newData, currentUser, origUserData) => {
    try{
        // COMMUNITY VERSION: Removed tenant-based architecture
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, newData);
        console.log("Updated user data!!!");
        pushInitialProfileCompletion({... origUserData, ...newData});

        // await updateTypesense('users', currentUser.uid, {... origUserData, ...newData});
    }catch(error){console.log(error)};
}

export const loadUserData = async (currentUser, setLoading, setUserData) => {
    let unsubscribe;
    setLoading(true);

    if (currentUser) {
        // COMMUNITY VERSION: Removed tenant-based architecture
        const userDocRef = doc(db, 'users', currentUser.uid);
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
      console.error(`Error uploading resume:`, error);
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
      console.error(`Error uploading profile picture:`, error);
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

export const validateLinkedInUrl = (url) => {
  // Accept any input as requested
  return true;
};

export const getVerificationStatus = (userData) => {
  if (!userData.linkedinLink) {
    return "unverified";
  }
  if (!validateLinkedInUrl(userData.linkedinLink)) {
    return "invalid";
  }
  return userData.verificationStatus || "pending";
};

// Connection functions have been moved to Firebase Cloud Functions
// See connectionService.jsx for the new implementation




// Connection functions have been moved to Firebase Cloud Functions
// See connectionService.jsx for the new implementation