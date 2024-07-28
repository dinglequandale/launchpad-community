import { collection, query, where, getDocs, startAt, endAt, orderBy, and } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const searchDocuments = async (collectionName, searchText) => {
  if (searchText.trim() === '') {
    return [];
  }

  try {
    const docsRef = collection(db, collectionName);
    
    const q1 = query(
        docsRef, 
        orderBy('organizationMission'),
        and(
            startAt(searchText),
            endAt(searchText + '~')
        )
    );
    const q2 = query(
        docsRef, 
        orderBy('organizationName'),
        and(
            startAt(searchText),
            endAt(searchText + '~')
        )
    );
    const q3 = query(
        docsRef, 
        orderBy('organizationType'),
        and(
            startAt(searchText),
            endAt(searchText + '~')
        )
    );

    const [snapshot1, snapshot2, snapshot3] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
      getDocs(q3),
    ]);

    const matches = [
      ...snapshot1.docs.map(doc => doc.data().organizationName),
      ...snapshot2.docs.map(doc => doc.data().organizationName),
      ...snapshot3.docs.map(doc => doc.data().organizationName),
    ];

    return [...new Set(matches)];
  } catch (error) {
    console.error('Error searching Firestore: ', error);
    return [];
  }
};

export { searchDocuments };