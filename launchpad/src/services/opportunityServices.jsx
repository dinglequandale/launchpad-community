import { db, storage } from '../firebase/firebaseConfig';
import { collection, addDoc, updateDoc, doc, query, where, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
// import { deleteFromTypesense, updateTypesense } from '../typesense/typesenseClient';

export const saveOpportunity = async (opportunityData, organizationLogo, currentUser, isEditing, opportunityId, collectionPath = "opportunities") => {
  // COMMUNITY VERSION: Removed tenant-based architecture
  const opportunitiesCollectionRef = collection(db, collectionPath);
  let opportunityRef;

  try {
    if (!isEditing) {
      opportunityRef = await addDoc(opportunitiesCollectionRef, {
        ...opportunityData,
        createdBy: currentUser.uid,
        createdAt: new Date()
      });

      // Update Typesense
      // await updateTypesense('opportunities', opportunityRef.id,
      //   {
      //     ...opportunityData,
      //     createdBy: currentUser.uid,
      //     createdAt: new Date(),
      //   });
    } else {
      opportunityRef = doc(db, collectionPath, opportunityId);
      await updateDoc(opportunityRef, opportunityData);
      // await updateTypesense('opportunities', opportunityId, opportunityData);
    }

    if (organizationLogo) {
      const logoUrl = await uploadImage(organizationLogo, opportunityRef.id);
      await updateDoc(opportunityRef, { organizationLogoPreview: logoUrl });
      // We don't add logo to typesense, as it is an image and there's no point in searching
    }

    return opportunityRef.id;
  } catch (error) {
    console.error("Error saving opportunity: ", error);
    throw error;
  }
};

export const stableLinkCheck = (link) => {
  if(!link.includes("http")){
    return "https://" + link;
  }
  else{
    return link;
  }
}

const uploadImage = async (file, opportunityId) => {
  const storageRef = ref(storage, `opportunity-logos/${opportunityId}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const loadOpportunities = (user, setLoading, setOpportunities, collectionPath = "opportunities") => {
  // COMMUNITY VERSION: Removed tenant-based architecture
  const opportunitiesRef = collection(db, collectionPath);
  const qUserOpportunity = query(opportunitiesRef, where("createdBy", "==", user.uid));
  
  return onSnapshot(qUserOpportunity, async (querySnapshot) => {
    setLoading(true);
    const opportunitiesArray = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // we only need this for one opportunity, but easier to expand for the future
    const opportunitiesWithLogos = await Promise.all(opportunitiesArray.map(async (opportunity) => {
      const logoDisplay = await loadOpportunityLogo(opportunity.id);
      return { ...opportunity, organizationLogoPreview: logoDisplay };
    }));

    setOpportunities(opportunitiesWithLogos);
    setLoading(false);
  }, (error) => {
    console.log("Error getting user opportunities: ", error);
    setLoading(false);
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

export const handleDeleteOpportunity = async (opportunityId, collectionPath = "opportunities") => {
    // COMMUNITY VERSION: Removed tenant-based architecture
    const opportunityDoc = doc(db, collectionPath, opportunityId);
    try {
        await deleteDoc(opportunityDoc);
        // await deleteFromTypesense('opportunities', opportunityId);
        toast.success("Opportunity deleted successfully!");
    } catch (error) {
        console.error("Error deleting user profile: ", error);
        toast.error("Error deleting your opportunity!")
        return;
    }
}