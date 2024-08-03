import { collection, query, where, getDocs, startAt, endAt, orderBy, and } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const searchDocuments = async (collectionName, searchText) => {
    if (searchText.trim() === '') {
      console.log('No search text provided');
      return;
    }
  
    try {
      const docsRef = collection(db, collectionName);
  
      const q = query(docsRef, orderBy('organizationName'), startAt(searchText), endAt(searchText + '\uf8ff'));
  
      const snapshot = await getDocs(q);
  
      const matches = snapshot.docs.map(doc => doc.data());
  
      console.log(matches);
    } catch (error) {
      console.error('Error searching Firestore: ', error);
    }
};

export { searchDocuments };