import { collection, query, where, getDocs, getDoc, doc, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { careerInterests } from '../pages/Onboarding/Options';

export async function getFilteredData(collectionName, filters, currentUserId, category = null, lastDoc = null, maxLimit = 6) {
    let q = collection(db, "tenants", localStorage.getItem("schoolId"), collectionName);

    const {userInterests, userColleges, userHS } = await getUserData("areasOfInterest", currentUserId);

    // Process filters based on actual Firebase data structure
    const filterOperations = await Promise.all(Object.entries(filters).map(async ([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        
        if (key === "areasOfInterestOrExpertise") {
            // Handle interest filtering - this field maps to areasOfInterest in user data
            if (value.includes("My Interests") || value.includes("My Fields of Expertise")) {
                const userInterestsExtended = getExtendedInterests(userInterests);
                
                if (collectionName === "opportunities") {
                    return { key: "organizationTags", operation: "array-contains-any", value: userInterestsExtended };
                } else {
                    return { key: "areasOfInterest", operation: "array-contains-any", value: userInterestsExtended };
                }
            } else if (Array.isArray(value)) {
                // Handle specific interest selections
                const specificInterests = value.filter(v => !v.includes("My") && !v.includes("Any"));
                if (specificInterests.length > 0) {
                    if (collectionName === "opportunities") {
                        return { key: "organizationTags", operation: "array-contains-any", value: specificInterests };
                    } else {
                        return { key: "areasOfInterest", operation: "array-contains-any", value: specificInterests };
                    }
                }
            }
        }
        else if (key === "schoolAttending") {
            // High school filtering - maps to schoolAttending field
            if (value === "My High School") {
                return { key: "schoolAttending", operation: "==", value: userHS };
            }
            // For other school selections, this would need to be handled differently
        }
        else if (key === "collegeInterestsOrDecision") {
            // College filtering - maps to collegeAttending for college students, collegeInterestsOrDecision for high schoolers
            if (value === "My College") {
                // This would need to get the user's committed college
                return null; // TODO: Implement this
            } else if (value === "My Dream Colleges") {
                // This would need to get the user's college interests
                return null; // TODO: Implement this
            } else if (Array.isArray(value) && value.length > 0) {
                // Handle specific college selections
                const specificColleges = value.filter(v => !v.includes("My") && !v.includes("Any"));
                if (specificColleges.length > 0) {
                    if (category === "Alumni") {
                        return { key: "collegeAttending", operation: "in", value: specificColleges };
                    } else if (category === "High Schooler") {
                        return { key: "collegeInterestsOrDecision", operation: "array-contains-any", value: specificColleges };
                    }
                }
            }
        }
        else if (key === "userType") {
            // User type filtering - this is handled by the category parameter
            return null;
        }
        else if (key === "organizationType") {
            // Handle organization type filtering
            if (value === "Any Category") return null;
            
            // Map filter options to actual organization types
            const organizationTypeMap = {
                "Clubs": "Club",
                "Workplace Opportunities": ["Internship", "Shadowing", "Job"],
                "Nonprofits": "Nonprofit",
                "Businesses": "Business",
                "Community Service": "Community Service",
                "Leadership": "Leadership"
            };
            
            const mappedType = organizationTypeMap[value];
            if (mappedType) {
                if (Array.isArray(mappedType)) {
                    return { key: "organizationType", operation: "in", value: mappedType };
                } else {
                    return { key: "organizationType", operation: "==", value: mappedType };
                }
            }
        }
        // Note: networkingCommitment field doesn't exist in user data, so we skip it
        
        return null;
    }));
  
    // Apply filters
    filterOperations.forEach(filter => {
        if (filter) {
            q = query(q, where(filter.key, filter.operation, filter.value));
        }
    });
  
    // Add category filter if specified
    if (category && collectionName === "users") {
        q = query(q, where('userType', '==', category));
        q = query(q, orderBy('userName'));
    }

    // Apply pagination
    if (lastDoc) q = query(q, startAfter(lastDoc));
    q = query(q, limit(maxLimit));

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((user) => user.id !== currentUserId);

    // Sort results by relevance based on interests
    try {
        const originalInterests = new Set(userInterests);
        results.sort((a, b) => {
            const aInterests = collectionName === "opportunities" ? (a.organizationTags || []) : (a.areasOfInterest || []);
            const bInterests = collectionName === "opportunities" ? (b.organizationTags || []) : (b.areasOfInterest || []);
            
            const aMatches = aInterests.filter(tag => originalInterests.has(tag)).length;
            const bMatches = bInterests.filter(tag => originalInterests.has(tag)).length;
            return bMatches - aMatches; // descending order
        });
    } catch (error) {
        console.warn("Error sorting by relevance:", error);
    }

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    return {results, lastVisible};
}

const getUserData = async (dataType, currentUserId) => {
    const userSnap = await getDoc(doc(db, "tenants", localStorage.getItem("schoolId"), "users", currentUserId));
    if (userSnap.exists()) {
        return {
            userInterests: userSnap.data()[dataType], 
            userColleges: userSnap.data()["collegeInterestsOrDecision"], 
            userHS: userSnap.data()["schoolAttending"]
        };
    } else {
        console.log("User not found!");
        return null;
    }
}

const getExtendedInterests = (initialInterests) => {
    if (!initialInterests || !Array.isArray(initialInterests)) return [];
    
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
  