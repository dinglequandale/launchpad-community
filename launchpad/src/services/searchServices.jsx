import { db } from '../firebase/firebaseConfig';
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { queryTokens } from '../utils/searchTokens';

const CANDIDATE_LIMIT = 60;
const RESULT_LIMIT = 20;

/**
 * In-house search over Firestore (replaces Algolia). Each document carries a
 * `searchTokens` array of word prefixes maintained by a Cloud Function
 * (functions/triggers/searchIndex.js). We query on the most selective word and
 * require every other word to be present too. Reads go through security rules.
 */
const fetchMatches = async (collectionPath, searchText) => {
  const tokens = queryTokens(searchText);
  if (tokens.length === 0) return [];
  const [primary, ...rest] = tokens; // longest word first = most selective

  const snapshot = await getDocs(query(
    collection(db, collectionPath),
    where('searchTokens', 'array-contains', primary),
    limit(CANDIDATE_LIMIT)
  ));

  return snapshot.docs
    .map((d) => ({ id: d.id, objectID: d.id, ...d.data() }))
    .filter((item) => rest.every((t) => item.searchTokens?.includes(t)))
    .map(({ searchTokens, ...item }) => item); // eslint-disable-line no-unused-vars
};

// Normalize openToCrossSchoolConnections values to handle legacy label strings from Firebase
const normalizeCrossSchoolPref = (val) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower === 'yes' || lower.includes("i'm open to connecting") || lower.includes("yes, i'm open")) return 'yes';
    if (lower === 'no' || lower.includes('my school community only') || lower.includes('no, i prefer')) return 'no';
    if (lower === 'not_applicable' || lower.includes('not applicable')) return 'not_applicable';
    return val;
};

// collectionName: 'users', 'opportunities' or a society path such as 'societies/hsfs/opportunities'
const searchDocuments = async (collectionName, searchText, currentUserId = null) => {
  const isUsers = collectionName === 'users' || collectionName.endsWith('/users');
  const isOpportunities = collectionName === 'opportunities' || collectionName.endsWith('/opportunities');
  try {
    let matches = await fetchMatches(collectionName, searchText);

    // Apply cross-school connection filtering if currentUserId is provided
    if (currentUserId && isUsers) {
      // Get current user's data
      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : null;
      const currentUserCollege = currentUserData?.collegeAttending;
      const currentUserHS = currentUserData?.schoolAttending;
      const currentUserType = currentUserData?.userType;
      const currentUserCrossSchool = currentUserData?.openToCrossSchoolConnections;

      // Filter based on viewed user's preferences (hide them from outsiders)
      matches = matches.filter(user => {
        if (user.objectID === currentUserId || user.id === currentUserId) return false;
        const pref = normalizeCrossSchoolPref(user.openToCrossSchoolConnections);

        if (user.userType === "Professional") {
          if (!pref || pref === 'yes' || pref === 'not_applicable') return true;
          if (pref === 'no') return user.schoolAttending && user.schoolAttending === currentUserHS;
        }

        if (user.userType === "College Student") {
          if (!pref || pref === 'yes') return true;
          if (pref === 'no') return user.collegeAttending && user.collegeAttending === currentUserCollege;
        }

        if (user.userType === "High Schooler") {
          if (!pref || pref === 'yes') return true;
          if (pref === 'no') return user.schoolAttending && user.schoolAttending === currentUserHS;
        }

        return true;
      });

      // Reverse filter: if current user has 'no', restrict what they can see
      const normalizedCurrentPref = normalizeCrossSchoolPref(currentUserCrossSchool);
      if (normalizedCurrentPref === 'no') {
        matches = matches.filter(user => {
          if (currentUserType === "Professional") {
            return user.schoolAttending && user.schoolAttending === currentUserHS;
          }
          if (currentUserType === "College Student") {
            const sameHS = user.schoolAttending && user.schoolAttending === currentUserHS;
            const sameCollege = currentUserCollege && user.collegeAttending && user.collegeAttending === currentUserCollege;
            return sameHS || sameCollege;
          }
          if (currentUserType === "High Schooler") {
            return user.schoolAttending && user.schoolAttending === currentUserHS;
          }
          return true;
        });
      }
    }

    // Apply cross-school connection filtering for opportunities
    if (currentUserId && isOpportunities) {
      // Get current user's data
      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : null;
      const currentUserCollege = currentUserData?.collegeAttending;
      const currentUserHS = currentUserData?.schoolAttending;
      const currentUserType = currentUserData?.userType;
      const currentUserCrossSchool = currentUserData?.openToCrossSchoolConnections;

      // Fetch creator data for all opportunities
      const creatorIds = [...new Set(matches.map(opp => opp.createdBy).filter(id => id))];
      const creatorsMap = {};

      if (creatorIds.length > 0) {
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
        creatorsData.forEach(creator => {
          if (creator) creatorsMap[creator.id] = creator;
        });

        // Filter opportunities based on creator preferences
        matches = matches.filter(opportunity => {
          const creator = creatorsMap[opportunity.createdBy];
          if (!creator) return true;
          const pref = normalizeCrossSchoolPref(creator.openToCrossSchoolConnections);

          if (creator.userType === "Professional") {
            if (!pref || pref === 'yes' || pref === 'not_applicable') return true;
            if (pref === 'no') return creator.schoolAttending && creator.schoolAttending === currentUserHS;
          }

          if (creator.userType === "College Student") {
            if (!pref || pref === 'yes') return true;
            if (pref === 'no') return creator.collegeAttending && creator.collegeAttending === currentUserCollege;
          }

          return true;
        });

        // Reverse filter: if current user has 'no', only show opportunities from their school community
        const normalizedCurrentPref = normalizeCrossSchoolPref(currentUserCrossSchool);
        if (normalizedCurrentPref === 'no') {
          matches = matches.filter(opportunity => {
            const creator = creatorsMap[opportunity.createdBy];
            if (!creator) return true;

            if (currentUserType === "Professional") {
              return creator.schoolAttending && creator.schoolAttending === currentUserHS;
            }
            if (currentUserType === "College Student") {
              const sameHS = creator.schoolAttending && creator.schoolAttending === currentUserHS;
              const sameCollege = currentUserCollege && creator.collegeAttending && creator.collegeAttending === currentUserCollege;
              return sameHS || sameCollege;
            }
            if (currentUserType === "High Schooler") {
              return creator.schoolAttending && creator.schoolAttending === currentUserHS;
            }
            return true;
          });
        }
      }
    }

    return matches.slice(0, RESULT_LIMIT);
  } catch (error) {
    console.error('Error searching: ', error);
    return [];
  }
};

export { searchDocuments };