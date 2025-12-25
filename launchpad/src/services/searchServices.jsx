import { algoliaClient } from '../typesense/typesenseClient'
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

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

      // Filter based on user preferences
      matches = matches.filter(user => {
        // Don't show the current user themselves
        if (user.objectID === currentUserId || user.id === currentUserId) return false;

        // Filter Professionals
        if (user.userType === "Professional") {
          if (!user.openToCrossSchoolConnections ||
              user.openToCrossSchoolConnections === 'yes' ||
              user.openToCrossSchoolConnections === 'not_applicable') {
            return true;
          }
          if (user.openToCrossSchoolConnections === 'no') {
            return user.schoolAttending && user.schoolAttending === currentUserHS;
          }
        }

        // Filter College Students
        if (user.userType === "College Student") {
          if (!user.openToCrossSchoolConnections || user.openToCrossSchoolConnections === 'yes') {
            return true;
          }
          if (user.openToCrossSchoolConnections === 'no') {
            return user.collegeAttending && user.collegeAttending === currentUserCollege;
          }
        }

        // Show High Schoolers and Staff to everyone
        return true;
      });
    }

    // Apply cross-school connection filtering for opportunities
    if (currentUserId && collectionName === 'opportunities') {
      // Get current user's data
      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : null;
      const currentUserCollege = currentUserData?.collegeAttending;
      const currentUserHS = currentUserData?.schoolAttending;

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
          if (!creator) return true; // Show if no creator data

          // Handle Professional creators
          if (creator.userType === "Professional") {
            if (!creator.openToCrossSchoolConnections ||
                creator.openToCrossSchoolConnections === 'yes' ||
                creator.openToCrossSchoolConnections === 'not_applicable') {
              return true;
            }
            if (creator.openToCrossSchoolConnections === 'no') {
              return creator.schoolAttending && creator.schoolAttending === currentUserHS;
            }
          }

          // Handle College Student creators
          if (creator.userType === "College Student") {
            if (!creator.openToCrossSchoolConnections || creator.openToCrossSchoolConnections === 'yes') {
              return true;
            }
            if (creator.openToCrossSchoolConnections === 'no') {
              return creator.collegeAttending && creator.collegeAttending === currentUserCollege;
            }
          }

          return true; // Show for High Schoolers and Staff
        });
      }
    }

    return matches;
  } catch (error) {
    console.error('Error searching algolia: ', error);
    return [];
  }
};

export { searchDocuments };