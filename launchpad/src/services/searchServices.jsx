import { collection, query, where, getDocs, startAt, endAt, orderBy, and } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const searchDocuments = async (collectionName, searchText) => {
    if (searchText.trim() === '') {
      console.log('No search text provided');
      return;
    }
  
    try {
      const docsRef = collection(db, collectionName);
  
      const q1 = query(docsRef, orderBy('organizationName'), startAt(searchText), endAt(searchText + '\uf8ff'));
      const q2 = query(docsRef, orderBy('organizationType'), startAt(searchText), endAt(searchText + '\uf8ff'));
      const q3 = query(docsRef, orderBy('organizationMission'), startAt(searchText), endAt(searchText + '\uf8ff'));
  
      const [snapshot1, snapshot2, snapshot3] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
        getDocs(q3),
      ]);
  
      const matches = [
        ...snapshot1.docs.map(doc => doc.data()),
        ...snapshot2.docs.map(doc => doc.data()),
        ...snapshot3.docs.map(doc => doc.data()),
      ];
  
      console.log([...new Set(matches)]);
    } catch (error) {
      console.error('Error searching Firestore: ', error);
    }
};

export { searchDocuments };