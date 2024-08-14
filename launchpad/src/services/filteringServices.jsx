import { collection, query, where, getDocs, getDoc, doc, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Adjust this import based on your Firebase setup
import { careerInterests } from '../pages/Onboarding/Options';

export async function getFilteredData(collectionName, filters, currentUserId, category = null, lastDoc = null, maxLimit = 9) {
    let q = collection(db, collectionName);

    const {userInterests, userColleges, userHS } = await getUserData("areasOfInterest", currentUserId);

    const filterOperations = await Promise.all(Object.entries(filters).map(async ([key, value]) => {
    if (value && (Array.isArray(value) || !value.startsWith('Any'))) {
        if (key === "areasOfInterestOrExpertise") {
          // const dataType = value;
          //   const userInterests = await getUserData(dataType, currentUserId);
          const userInterestsExtended = getExtendedInterests(userInterests);
          
          if (collectionName === "opportunities") {
              return { key: "organizationTags", operation: "array-contains-any", value: userInterestsExtended };
          } else {
              return { key: "areasOfInterest", operation: "array-contains-any", value: userInterestsExtended };
          }
        }
        else if(key === "schoolAttending"){
          return{
            key,
            operation: "==",
            value: userHS
          }
        }
        else if(key === "collegeInterestsOrDecision"){
            return {
                key: "collegeInterestsOrDecision",
                operation: "array-contains-any",
                value: userColleges,
            };
        } else if (Array.isArray(value)) {
            return { key, operation: 'in', value };
        } else {
            return { key, operation: '==', value };
        }
    }

    return null;
    }));
  
    filterOperations.forEach(filter => {
        if (filter) {
            q = query(q, where(filter.key, filter.operation, filter.value));
        }
      });
  
    // IMPORTANT TODO: PAGINATION / MAX LOAD
    
    if(category){
      // Add category filter
      q = query(q, where('userType', '==', category));

      // Add ordering to ensure consistent pagination
      q = query(q, orderBy('userName'));

      // Apply pagination
      if (lastDoc) {
          q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(maxLimit));
    }
    else{

      // Add ordering to ensure consistent pagination
      q = query(q, orderBy('createdAt'));

      if (lastDoc) {
          q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(10));
    }
    

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // sort results by relevance
    try{
    const originalInterests = new Set(userInterests);
    results.sort((a, b) => {
      const aMatches = a.organizationTags.filter(tag => originalInterests.has(tag)).length;
      const bMatches = b.organizationTags.filter(tag => originalInterests.has(tag)).length;
      return bMatches - aMatches; // descending order
    });
    }catch{}

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  
    return {results, lastVisible};
  
  }  

const getUserData = async (dataType, currentUserId) => {
    const userSnap = await getDoc(doc(db, "users", currentUserId));
    if(userSnap.exists()){
        return {userInterests: userSnap.data()[dataType], userColleges :userSnap.data()["collegeInterestsOrDecision"], userHS: userSnap.data()["schoolAttending"]};
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
  