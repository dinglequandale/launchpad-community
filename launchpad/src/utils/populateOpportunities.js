import { db } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import tempInitialOrgData from '../json_data/tempInitialOrgData.json';

/**
 * One-time script to populate the opportunities collection with initial organization data
 * Run this once to seed the database with Houston-area opportunities
 */
export const populateOpportunitiesCollection = async () => {
  console.log('Starting to populate opportunities collection...');

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const org of tempInitialOrgData) {
      try {
        // Add location field to each organization
        const orgWithLocation = {
          ...org,
          location: 'Houston, TX'
        };

        // Use organization name as document ID for consistency
        // COMMUNITY VERSION: Using flat collection structure (opportunities directly, not under tenants)
        const docId = org.organizationName.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize ID
        await setDoc(doc(db, 'opportunities', docId), orgWithLocation);

        console.log(`✓ Uploaded: ${org.organizationName}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error uploading ${org.organizationName}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Upload Complete ===');
    console.log(`✓ Successfully uploaded: ${successCount} opportunities`);
    console.log(`✗ Failed: ${errorCount} opportunities`);
    console.log(`Total: ${tempInitialOrgData.length} opportunities`);

    return { successCount, errorCount, total: tempInitialOrgData.length };
  } catch (error) {
    console.error('Fatal error during population:', error);
    throw error;
  }
};
