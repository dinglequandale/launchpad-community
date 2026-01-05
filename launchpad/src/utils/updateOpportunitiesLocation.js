import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

/**
 * One-time script to update the location field on all existing opportunities
 * Changes location from "houston_tx" to "Houston, TX"
 */
export const updateOpportunitiesLocation = async () => {
  console.log('Starting to update location field for all opportunities...');

  try {
    const opportunitiesRef = collection(db, 'opportunities');
    const snapshot = await getDocs(opportunitiesRef);

    let successCount = 0;
    let errorCount = 0;

    for (const docSnapshot of snapshot.docs) {
      try {
        await updateDoc(doc(db, 'opportunities', docSnapshot.id), {
          location: 'Houston, TX'
        });

        console.log(`✓ Updated: ${docSnapshot.data().organizationName}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error updating ${docSnapshot.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Update Complete ===');
    console.log(`✓ Successfully updated: ${successCount} opportunities`);
    console.log(`✗ Failed: ${errorCount} opportunities`);
    console.log(`Total: ${snapshot.docs.length} opportunities`);

    return { successCount, errorCount, total: snapshot.docs.length };
  } catch (error) {
    console.error('Fatal error during update:', error);
    throw error;
  }
};
