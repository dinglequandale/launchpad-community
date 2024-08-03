import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Adjust this import based on your Firebase setup
import { careerInterests } from '../pages/Onboarding/Options';

export async function getFilteredData(collectionName, filters, currentUserId) {
    let q = collection(db, collectionName);

    const {userType} = JSON.parse(localStorage.getItem("basicUserInfo"));

    const userInterests = await getUserData(userType === "Professional" ? "fieldsOfExpertise" : "areasOfInterest", currentUserId);
    console.log("Interests:", userInterests)
    // Create an array to hold all filter operations
    const filterOperations = await Promise.all(Object.entries(filters).map(async ([key, value]) => {
        if (value && (Array.isArray(value) || !value.startsWith('Any'))) {
            if (key === "areasOfInterestOrExpertise" || key === "collegeInterestsOrDecision") {
            const dataType = value;
            //   const userInterests = await getUserData(dataType, currentUserId);
            const userInterestsExtended = getExtendedInterests(userInterests);
            
            return {
                key: `${collectionName === "opportunities" ? "organizationTags" : dataType}`,
                operation: "array-contains-any",
                value: userInterestsExtended
            };
        } else if (Array.isArray(value)) {
          return { key, operation: 'in', value };
        } else {
          return { key, operation: '==', value };
        }
    }
    return null;
    }));
  
    // Apply all filters to the query
    filterOperations.forEach(filter => {
      if (filter) {
        q = query(q, where(filter.key, filter.operation, filter.value));
      }
    });

  
    // IMPORTANT TODO: PAGINATION / MAX LOAD
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort results by relevance
    try{
    const originalInterests = new Set(userInterests);
    results.sort((a, b) => {
      const aMatches = a.organizationTags.filter(tag => originalInterests.has(tag)).length;
      const bMatches = b.organizationTags.filter(tag => originalInterests.has(tag)).length;
      return bMatches - aMatches; // Descending order
    });
    }catch{}
  
    return results;
  
  }  

const getUserData = async (dataType, currentUserId) => {
    const userSnap = await getDoc(doc(db, "users", currentUserId));
    if(userSnap.exists()){
        return userSnap.data()[dataType];
    }else{
        console.log("User not found!");
        return null
    }
}

const getExtendedInterests = (initialInterests) => {
    const initialInterestSet = new Set(initialInterests);
  
    const groupMap = careerInterests.reduce((acc, interest) => {
      if (!acc[interest["group"]]) {
        acc[interest["group"]] = [];
      }
      acc[interest["group"]].push(interest["label"]);
      return acc;
    }, {});
  
    const relevantGroups = careerInterests
      .filter(interest => initialInterestSet.has(interest["label"]))
      .map(interest => interest["group"]);
  
    const extendedInterests = [...new Set(
      relevantGroups.flatMap(group => groupMap[group])
    )];

    extendedInterests.sort((a, b) => {
      if (initialInterestSet.has(a) && !initialInterestSet.has(b)) return -1;
      if (!initialInterestSet.has(a) && initialInterestSet.has(b)) return 1;
      return 0;
    });
  
    return extendedInterests;
  };
  