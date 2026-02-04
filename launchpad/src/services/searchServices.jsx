import { algoliaClient } from '../typesense/typesenseClient'
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Normalize openToCrossSchoolConnections values to handle legacy label strings from Firebase
const normalizeCrossSchoolPref = (val) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower === 'yes' || lower.includes("i'm open to connecting") || lower.includes("yes, i'm open")) return 'yes';
    if (lower === 'no' || lower.includes('my school community only') || lower.includes('no, i prefer')) return 'no';
    if (lower === 'not_applicable' || lower.includes('not applicable')) return 'not_applicable';
    return val;
};

// COMMUNITY VERSION: Removed tenantId parameter - no longer needed without multi-tenant architecture
const searchDocuments = async (collectionName, searchText, currentUserId = null) => {
  try {
    const {results} = await algoliaClient.search({
              requests: [{ indexName: collectionName, query: searchText, hitsPerPage: 10 }],
            });
    let matches = results[0].hits;

    // Apply cross-school connection filtering if currentUserId is provided
    if (currentUserId && collectionName === 'users') {
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
    if (currentUserId && collectionName === 'opportunities') {
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

    return matches;
  } catch (error) {
    console.error('Error searching algolia: ', error);
    return [];
  }
};

export { searchDocuments };