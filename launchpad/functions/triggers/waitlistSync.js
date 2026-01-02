const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Sync waitlist entries to Google Sheets
 * Triggered when a new document is created in the 'waitlist' collection
 *
 * Setup Instructions:
 * 1. Create a Google Cloud Service Account with Google Sheets API enabled
 * 2. Download the service account JSON key
 * 3. Share your Google Sheet with the service account email
 * 4. Set environment variables in Firebase:
 *    - GOOGLE_SHEETS_SPREADSHEET_ID: Your spreadsheet ID from the URL
 *    - GOOGLE_SERVICE_ACCOUNT: The entire JSON service account key (as a string)
 *
 * To set environment variables:
 * firebase functions:config:set google.sheets.spreadsheet_id="YOUR_SPREADSHEET_ID"
 * firebase functions:config:set google.service_account='{"type":"service_account",...}'
 */
exports.onWaitlistEntryCreated = functions.firestore
    .document('waitlist/{waitlistId}')
    .onCreate(async (snap, context) => {
        const waitlistData = snap.data();
        const waitlistId = context.params.waitlistId;

        try {
            // Get configuration from Firebase environment variables
            const spreadsheetId = functions.config().google?.sheets?.spreadsheet_id;
            const serviceAccount = functions.config().google?.service_account;

            if (!spreadsheetId || !serviceAccount) {
                console.error('Google Sheets configuration missing. Please set up environment variables.');
                console.log('Run: firebase functions:config:set google.sheets.spreadsheet_id="YOUR_ID"');
                console.log('Run: firebase functions:config:set google.service_account=\'{"type":"service_account",...}\'');
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
            const timestamp = waitlistData.createdAt
                ? new Date(waitlistData.createdAt._seconds * 1000).toISOString()
                : new Date().toISOString();

            const interests = Array.isArray(waitlistData.interests)
                ? waitlistData.interests.join(', ')
                : waitlistData.interests || '';

            // Prepare row data
            const rowData = [
                timestamp,
                waitlistData.fullName || '',
                waitlistData.email || '',
                waitlistData.gradeLevel || '',
                interests,
                waitlistId
            ];

            // Append the row to the sheet
            await sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: 'Sheet1!A:F', // Adjust sheet name and range as needed
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

            console.log(`Successfully synced waitlist entry ${waitlistId} to Google Sheets`);

        } catch (error) {
            console.error('Error syncing to Google Sheets:', error);

            // Update Firestore to indicate sync failure
            await snap.ref.update({
                syncedToSheets: false,
                syncError: error.message,
                lastSyncAttempt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    });

/**
 * Manual callable function to re-sync failed entries
 * Can be called from the frontend to retry failed syncs
 */
exports.resyncWaitlistToSheets = functions.https.onCall(async (data, context) => {
    // Require authentication (admin only)
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Must be authenticated to resync waitlist entries'
        );
    }

    try {
        // Get all waitlist entries that haven't been synced
        const failedEntries = await db.collection('waitlist')
            .where('syncedToSheets', '==', false)
            .get();

        const syncPromises = [];

        failedEntries.forEach(doc => {
            // Trigger the sync manually
            syncPromises.push(
                exports.onWaitlistEntryCreated(doc, { params: { waitlistId: doc.id } })
            );
        });

        await Promise.all(syncPromises);

        return {
            success: true,
            count: failedEntries.size,
            message: `Re-synced ${failedEntries.size} waitlist entries`
        };

    } catch (error) {
        console.error('Error re-syncing waitlist entries:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
