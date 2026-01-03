const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Sync 6 Degree Mentor Application entries to Google Sheets
 * Triggered when a new document is created in the '6_degree_applications' collection
 *
 * Setup Instructions:
 * 1. Create a Google Cloud Service Account with Google Sheets API enabled
 * 2. Download the service account JSON key
 * 3. Share your Google Sheet with the service account email
 * 4. Set environment variables in Firebase:
 *    - GOOGLE_SHEETS_APPLICATIONS_SPREADSHEET_ID: Your spreadsheet ID from the URL
 *    - GOOGLE_SERVICE_ACCOUNT: The entire JSON service account key (as a string)
 *
 * To set environment variables:
 * firebase functions:config:set google.sheets.applications_spreadsheet_id="YOUR_SPREADSHEET_ID"
 * firebase functions:config:set google.service_account='{"type":"service_account",...}'
 *
 * Note: Multiple uploaded files are supported. Each file's name and Firebase Storage URL
 * are included in the spreadsheet, with each file on a new line within the cell.
 */
exports.onSixDegreeApplicationCreated = functions.firestore
    .document('6_degree_applications/{applicationId}')
    .onCreate(async (snap, context) => {
        const applicationData = snap.data();
        const applicationId = context.params.applicationId;

        try {
            // Get configuration from Firebase environment variables
            const spreadsheetId = functions.config().google?.sheets?.applications_spreadsheet_id;
            const serviceAccount = functions.config().google?.service_account;

            if (!spreadsheetId || !serviceAccount) {
                console.error('Google Sheets configuration missing for 6 Degree Applications.');
                console.log('Run: firebase functions:config:set google.sheets.applications_spreadsheet_id="YOUR_ID"');
                console.log('Run: firebase functions:config:set google.service_account=\'{"type":"service_account",...}\'');
                // Don't return - we'll mark as not synced and continue
                await snap.ref.update({
                    syncedToSheets: false,
                    syncError: 'Google Sheets configuration missing',
                    lastSyncAttempt: admin.firestore.FieldValue.serverTimestamp()
                });
                return;
            }

            // Parse service account if it's a string
            const credentials = typeof serviceAccount === 'string'
                ? JSON.parse(serviceAccount)
                : serviceAccount;

            // Authenticate with Google Sheets API
            const auth = new google.auth.GoogleAuth({
                credentials: credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            const sheets = google.sheets({ version: 'v4', auth });

            // Format the data for the spreadsheet
            const timestamp = applicationData.createdAt
                ? new Date(applicationData.createdAt._seconds * 1000).toISOString()
                : new Date().toISOString();

            // Interests is now a string (short answer) instead of array
            const interests = applicationData.interests || '';

            const path = applicationData.selectedPath === 'existing' ? 'Existing Mentor' : 'New Mentor';

            // Format uploaded files as clickable links (new format with array of file objects)
            let fileLinks = '';
            if (applicationData.uploadedFiles && Array.isArray(applicationData.uploadedFiles)) {
                // New format: array of file objects with url, name, etc.
                fileLinks = applicationData.uploadedFiles
                    .map(file => {
                        const fileName = file.name || 'File';
                        const fileUrl = file.url || '';
                        return `${fileName}: ${fileUrl}`;
                    })
                    .join('\n');
            } else if (applicationData.resumeUrl) {
                // Legacy format: single resume URL (for backwards compatibility)
                fileLinks = applicationData.resumeUrl;
            }

            // Prepare row data based on path
            let rowData;

            if (applicationData.selectedPath === 'existing') {
                // PATH 1: Existing Mentor
                const materials = Array.isArray(applicationData.existingMaterials)
                    ? applicationData.existingMaterials.join(', ')
                    : applicationData.existingMaterials || '';

                rowData = [
                    timestamp,                                  // A: Timestamp
                    applicationData.userName || '',             // B: Name
                    applicationData.userEmail || '',            // C: Email
                    path,                                       // D: Path
                    applicationData.selectedMentor || '',       // E: Mentor (PATH 1 only)
                    applicationData.workDescription || '',      // F: What to work on
                    applicationData.mentorInterest || '',       // G: Why this mentor (PATH 1 only)
                    materials,                                  // H: Existing materials (PATH 1 only)
                    fileLinks,                                  // I: File URLs (one per line with file names)
                    interests,                                  // J: Academic interests
                    applicationData.hasNewUploads ? 'Yes' : 'No', // K: New files uploaded?
                    applicationData.hasExistingResume ? 'Yes' : 'No', // L: Has existing resume?
                    applicationData.userId || '',               // M: User ID
                    applicationId                               // N: Application ID
                ];
            } else {
                // PATH 2: New Mentor
                rowData = [
                    timestamp,                                  // A: Timestamp
                    applicationData.userName || '',             // B: Name
                    applicationData.userEmail || '',            // C: Email
                    path,                                       // D: Path
                    'N/A',                                      // E: Mentor (PATH 2 doesn't have this)
                    applicationData.workDescription || '',      // F: What to work on
                    'N/A',                                      // G: Why this mentor (PATH 2 doesn't have this)
                    'N/A',                                      // H: Existing materials (PATH 2 doesn't have this)
                    fileLinks,                                  // I: File URLs (one per line with file names)
                    interests,                                  // J: Academic interests
                    applicationData.hasNewUploads ? 'Yes' : 'No', // K: New files uploaded?
                    applicationData.hasExistingResume ? 'Yes' : 'No', // L: Has existing resume?
                    applicationData.userId || '',               // M: User ID
                    applicationId                               // N: Application ID
                ];
            }

            // Append the row to the sheet
            await sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: 'Sheet1!A:N', // 14 columns: A through N
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [rowData]
                }
            });

            // Update Firestore document to mark as synced
            await snap.ref.update({
                syncedToSheets: true,
                syncedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`Successfully synced 6 degree application ${applicationId} to Google Sheets`);

        } catch (error) {
            console.error('Error syncing 6 degree application to Google Sheets:', error);

            // Update Firestore to indicate sync failure
            await snap.ref.update({
                syncedToSheets: false,
                syncError: error.message,
                lastSyncAttempt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    });

/**
 * Manual callable function to re-sync failed application entries
 * Can be called from the frontend to retry failed syncs
 */
exports.resyncSixDegreeApplicationsToSheets = functions.https.onCall(async (data, context) => {
    // Require authentication (admin only recommended)
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Must be authenticated to resync application entries'
        );
    }

    try {
        // Get all application entries that haven't been synced
        const failedEntries = await db.collection('6_degree_applications')
            .where('syncedToSheets', '==', false)
            .get();

        const syncPromises = [];

        failedEntries.forEach(doc => {
            // Trigger the sync manually
            syncPromises.push(
                exports.onSixDegreeApplicationCreated(doc, { params: { applicationId: doc.id } })
            );
        });

        await Promise.all(syncPromises);

        return {
            success: true,
            count: failedEntries.size,
            message: `Re-synced ${failedEntries.size} application entries`
        };

    } catch (error) {
        console.error('Error re-syncing application entries:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
