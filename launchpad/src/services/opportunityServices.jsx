import { db, storage } from '../firebase/firebaseConfig';
import { collection, addDoc, updateDoc, doc, query, getDocs, where, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

export const saveOpportunity = async (opportunityData, organizationLogo, currentUser, isEditing, opportunityId) => {
  const opportunitiesCollectionRef = collection(db, "opportunities");
  let opportunityRef;

  try {
    if (!isEditing) {
      opportunityRef = await addDoc(opportunitiesCollectionRef, {
        ...opportunityData,
        createdBy: currentUser.uid,
        createdAt: new Date()
      });
    } else {
      opportunityRef = doc(db, "opportunities", opportunityId);
      await updateDoc(opportunityRef, opportunityData);
    }

    if (organizationLogo) {
      const logoUrl = await uploadImage(organizationLogo, opportunityRef.id);
      await updateDoc(opportunityRef, { organizationLogoPreview: logoUrl });
    }

    return opportunityRef.id;
  } catch (error) {
    console.error("Error saving opportunity: ", error);
    throw error;
  }
};

const uploadImage = async (file, opportunityId) => {
  const storageRef = ref(storage, `opportunity-logos/${opportunityId}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const loadOpportunities = async (currentUser) => {
    const opportunitiesRef = collection(db, "opportunities");
    try {
        const qUserOpportunity = query(opportunitiesRef, where("createdBy", "==", currentUser.uid));
        const querySnapshot = await getDocs(qUserOpportunity);

        const opportunitiesArray = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return opportunitiesArray[0];
        
        } catch (error) {
        console.log("Error getting user opportunities: ", error);
        }
}

export const handleDeleteOpportunity = async (opportunityId) => {
    console.log(opportunityId)
    const opportunityDoc = doc(db, "opportunities", opportunityId);
    try {
        await deleteDoc(opportunityDoc);
        toast.success("Opportunity deleted successfully!");
    } catch (error) {
        console.error("Error deleting user profile: ", error);
        toast.error("Error deleting your opportunity!")
        return;
    }
}