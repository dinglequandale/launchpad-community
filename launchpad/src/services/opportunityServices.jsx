import { db, storage } from '../firebase/firebaseConfig';
import { collection, addDoc, updateDoc, doc, query, getDocs, where, deleteDoc, onSnapshot } from 'firebase/firestore';
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

export const loadOpportunities = (currentUser, setLoading, setOpportunities) => {
  const opportunitiesRef = collection(db, "opportunities");
  const qUserOpportunity = query(opportunitiesRef, where("createdBy", "==", currentUser.uid));
  
  return onSnapshot(qUserOpportunity, async (querySnapshot) => {
    try {
      setLoading(true);
      const opportunitiesArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // we only need this for one opportunity, but easier to expand for the future
      const opportunitiesWithLogos = await Promise.all(opportunitiesArray.map(async (opportunity) => {
        const logoDisplay = await loadOpportunityLogo(opportunity.id);
        console.log(`Logo URL for opportunity ${opportunity.id}:`, logoDisplay);
        return { ...opportunity, organizationLogoPreview: logoDisplay };
      }));

      setOpportunities(opportunitiesWithLogos[0]);
    } catch (error) {
      console.error("Error processing opportunities:", error);
    }
    finally {
      setLoading(false);
    }
  }, (error) => {
    console.error("Error getting user opportunities: ", error);
  });
};


const loadOpportunityLogo = async (opportunityId) => {
  const storageRef = ref(storage, `opportunity-logos/${opportunityId}`);

  try {
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error getting download URL:", error);
    return null;
  }
};

export const handleDeleteOpportunity = async (opportunityId) => {
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