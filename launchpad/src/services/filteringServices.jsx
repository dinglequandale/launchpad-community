import { collection, query, where, getDocs, getDoc, doc, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { careerInterests } from '../pages/Onboarding/Options';

// Normalize openToCrossSchoolConnections values to handle legacy label strings from Firebase
const normalizeCrossSchoolPref = (val) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower === 'yes' || lower.includes("i'm open to connecting") || lower.includes("yes, i'm open")) return 'yes';
    if (lower === 'no' || lower.includes('my school community only') || lower.includes('no, i prefer')) return 'no';
    if (lower === 'not_applicable' || lower.includes('not applicable')) return 'not_applicable';
    return val;
};

export async function getFilteredData(collectionName, filters, currentUserId, category = null, lastDoc = null, maxLimit = 6) {
    // COMMUNITY VERSION: Removed tenant-based architecture
    let q = collection(db, collectionName);

    const {userInterests, userColleges, userHS, userCity, userCollege, userType, openToCrossSchoolConnections } = await getUserData("areasOfInterest", currentUserId);

    // Separate array filters from other filters to avoid Firebase conflicts
    const arrayFilters = [];
    const otherFilters = [];
    
    // Process filters based on actual Firebase data structure
    const filterOperations = await Promise.all(Object.entries(filters).map(async ([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        
        if (key === "areasOfInterestOrExpertise") {
            // Handle interest filtering - this field maps to areasOfInterest in user data
            if (value.includes("My Interests") || value.includes("My Fields of Expertise")) {
                const userInterestsExtended = getExtendedInterests(userInterests);
                
                if (collectionName === "opportunities") {
                    arrayFilters.push({ key: "organizationTags", operation: "array-contains-any", value: userInterestsExtended });
                } else {
                    arrayFilters.push({ key: "areasOfInterest", operation: "array-contains-any", value: userInterestsExtended });
                }
                return null; // Don't apply this filter directly
            } else if (Array.isArray(value)) {
                // Handle specific interest selections
                const specificInterests = value.filter(v => !v.includes("My") && !v.includes("Any"));
                if (specificInterests.length > 0) {
                    if (collectionName === "opportunities") {
                        arrayFilters.push({ key: "organizationTags", operation: "array-contains-any", value: specificInterests });
                    } else {
                        arrayFilters.push({ key: "areasOfInterest", operation: "array-contains-any", value: specificInterests });
                    }
                }
                return null; // Don't apply this filter directly
            }
        }
        else if (key === "schoolAttending") {
            // High school filtering - maps to schoolAttending field
            if (value === "My High School") {
                return { key: "schoolAttending", operation: "==", value: userHS };
            } else if (value !== "Any High School" && value) {
                // Filter by specific high school across all user types
                return { key: "schoolAttending", operation: "==", value: value };
            }
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
                    if (category === "College Student") {
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
        else if (key === "location") {
            // Handle location filtering
            if (value === "Any Location" || (Array.isArray(value) && value.includes("Any Location"))) {
                return null;
            }

            if (Array.isArray(value)) {
                const specificLocations = value.filter(v => !v.includes("Any"));
                if (specificLocations.length > 0) {
                    // Use 'in' operator for multiple locations
                    return { key: "location", operation: "in", value: specificLocations };
                }
            } else if (value && value !== "Any Location") {
                // Filter by specific location (single value)
                return { key: "location", operation: "==", value: value };
            }
        }
        else if (key === "networkingLevel") {
            // Handle networking level filtering
            if (value === "Any Availability" || (Array.isArray(value) && value.includes("Any Availability"))) {
                return null;
            }
            
            if (Array.isArray(value)) {
                const specificLevels = value.filter(v => !v.includes("Any"));
                if (specificLevels.length > 0) {
                    arrayFilters.push({ key: "networkingLevel", operation: "array-contains-any", value: specificLevels });
                }
                return null; // Don't apply this filter directly
            } else if (value && !value.includes("Any")) {
                arrayFilters.push({ key: "networkingLevel", operation: "array-contains", value: value });
                return null; // Don't apply this filter directly
            }
        }
        
        return null;
    }));
  
    // Apply non-array filters first
    filterOperations.forEach(filter => {
        if (filter) {
            q = query(q, where(filter.key, filter.operation, filter.value));
        }
    });
  
    // Add category filter if specified
    if (category && collectionName === "users") {
        console.log('[filteringServices] ⚠️  QUERYING FOR userType ==', category);
        q = query(q, where('userType', '==', category));
        q = query(q, orderBy('userName'));
    }

    // Apply pagination
    if (lastDoc) q = query(q, startAfter(lastDoc));
    q = query(q, limit(maxLimit * 2)); // Get more results to account for post-filtering

    console.log('[filteringServices] Executing Firebase query...');
    const querySnapshot = await getDocs(q);
    console.log('[filteringServices] ✅ Firebase returned', querySnapshot.docs.length, 'documents');

    // Log the actual userType values returned
    if (querySnapshot.docs.length > 0) {
        const userTypes = querySnapshot.docs.map(doc => doc.data().userType);
        console.log('[filteringServices] UserTypes in results:', [...new Set(userTypes)]);
    }

    // Create a map of document IDs to document references for pagination cursor tracking
    const docMap = new Map();
    querySnapshot.docs.forEach(doc => {
        docMap.set(doc.id, doc);
    });

    let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('[filteringServices] Before currentUser filter:', results.length, 'results');

    results = results.filter((user) => user.id !== currentUserId);
    console.log('[filteringServices] After currentUser filter:', results.length, 'results');

    // Apply array filters in post-processing to avoid Firebase conflicts
    if (arrayFilters.length > 0) {
        results = results.filter(user => {
            return arrayFilters.every(filter => {
                const userValue = user[filter.key];
                if (!userValue || !Array.isArray(userValue)) return false;
                
                if (filter.operation === "array-contains-any") {
                    return filter.value.some(val => userValue.includes(val));
                } else if (filter.operation === "array-contains") {
                    return userValue.includes(filter.value);
                }
                return true;
            });
        });
    }

    // Additional post-processing: Exclude professionals when college filtering is active
    if (filters.collegeInterestsOrDecision && Array.isArray(filters.collegeInterestsOrDecision) && filters.collegeInterestsOrDecision.length > 0) {
        const specificColleges = filters.collegeInterestsOrDecision.filter(v => !v.includes("My") && !v.includes("Any"));
        if (specificColleges.length > 0) {
            results = results.filter(user => {
                // Exclude professionals (they don't have college data)
                if (user.userType === "Professional") return false;

                // For College Students, check collegeAttending
                if (user.userType === "College Student") {
                    return user.collegeAttending && specificColleges.includes(user.collegeAttending);
                }

                // For High Schoolers, check collegeInterestsOrDecision
                if (user.userType === "High Schooler") {
                    return user.collegeInterestsOrDecision &&
                           Array.isArray(user.collegeInterestsOrDecision) &&
                           user.collegeInterestsOrDecision.some(college => specificColleges.includes(college));
                }

                return false; // Exclude other user types
            });
        }
    }

    // Filter professionals based on cross-school connection preferences
    if (collectionName === "users" && (category === "Professional" || !category)) {
        results = results.filter(user => {
            if (user.userType !== "Professional") return true;
            const pref = normalizeCrossSchoolPref(user.openToCrossSchoolConnections);
            if (!pref || pref === 'yes' || pref === 'not_applicable') return true;
            if (pref === 'no') return user.schoolAttending && user.schoolAttending === userHS;
            return true;
        });
    }

    // Filter college students based on cross-school connection preferences
    if (collectionName === "users" && (category === "College Student" || !category)) {
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        const currentUserCollege = currentUserDoc.exists() ? currentUserDoc.data().collegeAttending : null;

        results = results.filter(user => {
            if (user.userType !== "College Student") return true;
            const pref = normalizeCrossSchoolPref(user.openToCrossSchoolConnections);
            if (!pref || pref === 'yes') return true;
            if (pref === 'no') return user.collegeAttending && user.collegeAttending === currentUserCollege;
            return true;
        });
    }

    // Filter high schoolers based on cross-school connection preferences
    if (collectionName === "users" && (category === "High Schooler" || !category)) {
        results = results.filter(user => {
            if (user.userType !== "High Schooler") return true;
            const pref = normalizeCrossSchoolPref(user.openToCrossSchoolConnections);
            if (!pref || pref === 'yes') return true;
            if (pref === 'no') return user.schoolAttending && user.schoolAttending === userHS;
            return true;
        });
    }

    // Reverse filter: if the CURRENT user has openToCrossSchoolConnections === 'no',
    // restrict what they can see to users from their own school community
    const normalizedCurrentPref = normalizeCrossSchoolPref(openToCrossSchoolConnections);
    if (collectionName === "users" && normalizedCurrentPref === 'no') {
        results = results.filter(user => {
            if (user.userId === currentUserId || user.id === currentUserId) return true;

            if (userType === "Professional") {
                // Professional with 'no': only see users from their affiliated high school
                return user.schoolAttending && user.schoolAttending === userHS;
            }

            if (userType === "College Student") {
                // College student with 'no': only see users from their high school or college
                const sameHS = user.schoolAttending && user.schoolAttending === userHS;
                const sameCollege = userCollege && user.collegeAttending && user.collegeAttending === userCollege;
                return sameHS || sameCollege;
            }

            if (userType === "High Schooler") {
                return user.schoolAttending && user.schoolAttending === userHS;
            }

            return true;
        });
    }

    // Filter opportunities based on owner's cross-school connection preferences
    if (collectionName === "opportunities") {
        // Fetch all unique creator IDs and current user data
        const creatorIds = [...new Set(results.map(opp => opp.createdBy).filter(id => id))];
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        const currentUserCollege = currentUserDoc.exists() ? currentUserDoc.data().collegeAttending : null;

        if (creatorIds.length > 0) {
            // Fetch creator data for all opportunities
            const creatorDataPromises = creatorIds.map(async (creatorId) => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', creatorId));
                    return userDoc.exists() ? { id: creatorId, ...userDoc.data() } : null;
                } catch (error) {
                    console.error(`Error fetching creator ${creatorId}:`, error);
                    return null;
                }
            });

            const creatorsData = await Promise.all(creatorDataPromises);
            const creatorsMap = {};
            creatorsData.forEach(creator => {
                if (creator) creatorsMap[creator.id] = creator;
            });

            // Filter opportunities based on creator preferences
            results = results.filter(opportunity => {
                const creator = creatorsMap[opportunity.createdBy];
                if (!creator) return true;

                const pref = normalizeCrossSchoolPref(creator.openToCrossSchoolConnections);

                if (creator.userType === "Professional") {
                    if (!pref || pref === 'yes' || pref === 'not_applicable') return true;
                    if (pref === 'no') return creator.schoolAttending && creator.schoolAttending === userHS;
                }

                if (creator.userType === "College Student") {
                    if (!pref || pref === 'yes') return true;
                    if (pref === 'no') return creator.collegeAttending && creator.collegeAttending === currentUserCollege;
                }

                return true;
            });
        }
    }

    // Reverse filter for opportunities: if current user has 'no', only show opportunities
    // from creators in their school community
    if (collectionName === "opportunities" && normalizedCurrentPref === 'no') {
        const creatorIds = [...new Set(results.map(opp => opp.createdBy).filter(id => id))];
        if (creatorIds.length > 0) {
            const creatorDataPromises = creatorIds.map(async (creatorId) => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', creatorId));
                    return userDoc.exists() ? { id: creatorId, ...userDoc.data() } : null;
                } catch (error) {
                    return null;
                }
            });
            const creatorsData = await Promise.all(creatorDataPromises);
            const creatorsMap = {};
            creatorsData.forEach(creator => {
                if (creator) creatorsMap[creator.id] = creator;
            });

            results = results.filter(opportunity => {
                const creator = creatorsMap[opportunity.createdBy];
                if (!creator) return true;

                if (userType === "Professional") {
                    return creator.schoolAttending && creator.schoolAttending === userHS;
                }
                if (userType === "College Student") {
                    const sameHS = creator.schoolAttending && creator.schoolAttending === userHS;
                    const sameCollege = userCollege && creator.collegeAttending && creator.collegeAttending === userCollege;
                    return sameHS || sameCollege;
                }
                if (userType === "High Schooler") {
                    return creator.schoolAttending && creator.schoolAttending === userHS;
                }
                return true;
            });
        }
    }

    // Limit results after post-filtering
    results = results.slice(0, maxLimit);

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

    // Get the lastVisible cursor based on the actual last result returned (not the last doc from Firebase)
    // This ensures pagination continues from where we actually stopped, not from where Firebase stopped
    const lastResultId = results[results.length - 1]?.id;
    const lastVisible = lastResultId ? docMap.get(lastResultId) : null;

    console.log('[filteringServices] 📄 Returning', results.length, 'results. LastVisible:', lastVisible?.id);
    return {results, lastVisible};
}

const getUserData = async (dataType, currentUserId) => {
    // COMMUNITY VERSION: Removed tenant-based architecture
    const userSnap = await getDoc(doc(db, "users", currentUserId));
    if (userSnap.exists()) {
        return {
            userInterests: userSnap.data()[dataType],
            userColleges: userSnap.data()["collegeInterestsOrDecision"],
            userHS: userSnap.data()["schoolAttending"],
            userCity: userSnap.data()["city"],
            userCollege: userSnap.data()["collegeAttending"],
            userType: userSnap.data()["userType"],
            openToCrossSchoolConnections: userSnap.data()["openToCrossSchoolConnections"],
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
  