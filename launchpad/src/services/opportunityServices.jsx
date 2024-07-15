import { db, storage } from '../firebase/firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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