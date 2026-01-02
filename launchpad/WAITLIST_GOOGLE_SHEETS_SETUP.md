# Waitlist Google Sheets Integration Setup Guide

This guide explains how to set up automatic syncing of waitlist entries to Google Sheets.

## Overview

The waitlist system works as follows:
1. User submits the waitlist form at `/waitlist`
2. Data is saved to Firestore `waitlist` collection (reliable backup)
3. A Cloud Function automatically syncs the data to Google Sheets
4. If sync fails, data remains in Firestore and can be re-synced later

## Setup Instructions

### Step 1: Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create one)
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**
5. Name it something like `launchpad-sheets-sync`
6. Click **Create and Continue**
7. Skip the optional steps and click **Done**
8. Click on the newly created service account
9. Go to the **Keys** tab
10. Click **Add Key** > **Create New Key**
11. Choose **JSON** format
12. Download the JSON key file (keep it secure!)

### Step 2: Enable Google Sheets API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click on it and click **Enable**

### Step 3: Create and Set Up Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it something like "Launchpad Waitlist"
4. In the first row (headers), add these columns:
   - A1: `Timestamp`
   - B1: `Full Name`
   - C1: `Email`
   - D1: `Grade Level`
   - E1: `Interests`
   - F1: `Entry ID`
5. Copy the **Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Example: If URL is `https://docs.google.com/spreadsheets/d/1ABC123xyz/edit`
   - Then Spreadsheet ID is: `1ABC123xyz`
6. **Important**: Share the spreadsheet with the service account email
   - Click **Share** button
   - Add the service account email (found in the JSON key file as `client_email`)
   - Give it **Editor** permissions

### Step 4: Configure Firebase Functions

You need to set two environment variables in Firebase Functions:

#### Option A: Using Firebase CLI (Recommended)

```bash
# Navigate to your project directory
cd /path/to/launchpad-community/launchpad

# Set the Spreadsheet ID
firebase functions:config:set google.sheets.spreadsheet_id="YOUR_SPREADSHEET_ID"

# Set the service account credentials
# Replace the content below with your actual JSON key (keep it as a single line)
firebase functions:config:set google.service_account='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**Important**: When setting the service account JSON:
- Make sure to escape the entire JSON as a single-line string
- Keep all newlines in the private key as `\n`
- Wrap the entire JSON in single quotes

#### Option B: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Functions** > **Configuration**
4. Add these environment variables:
   - Key: `google.sheets.spreadsheet_id`, Value: `YOUR_SPREADSHEET_ID`
   - Key: `google.service_account`, Value: `{entire JSON content}`

### Step 5: Deploy the Cloud Functions

```bash
cd /path/to/launchpad-community/launchpad

# Deploy the waitlist sync functions
firebase deploy --only functions:onWaitlistEntryCreated,functions:resyncWaitlistToSheets
```

## Testing the Integration

1. Navigate to `http://localhost:3000/waitlist` (or your deployed URL)
2. Fill out the waitlist form
3. Submit the form
4. Check your Google Sheet - a new row should appear within seconds
5. Check Firestore Console - the entry should have `syncedToSheets: true`

## Troubleshooting

### Check Function Logs

```bash
firebase functions:log --only onWaitlistEntryCreated
```

### Common Issues

1. **"Configuration missing" error**
   - Verify environment variables are set: `firebase functions:config:get`
   - Redeploy functions after setting config

2. **"Permission denied" error**
   - Make sure the Google Sheet is shared with the service account email
   - Verify the service account has Google Sheets API enabled

3. **"Invalid credentials" error**
   - Check that the JSON key is properly formatted (especially the private key)
   - Make sure there are no extra spaces or line breaks

4. **Entries not syncing**
   - Check Firebase Functions logs for errors
   - Verify the spreadsheet ID is correct
   - Make sure the sheet name is "Sheet1" (or update the code in `waitlistSync.js`)

### Re-sync Failed Entries

If some entries failed to sync, you can manually trigger a re-sync:

```javascript
// From your Firebase console or a custom admin panel
const resyncWaitlist = httpsCallable(getFunctions(), 'resyncWaitlistToSheets');
const result = await resyncWaitlist();
console.log(result.data.message); // "Re-synced X waitlist entries"
```

## Data Structure

### Firestore Document Structure
```javascript
{
  fullName: "John Doe",
  email: "john@example.com",
  gradeLevel: "11th Grade",
  interests: ["Computer Science", "Engineering", "Business"],
  createdAt: Timestamp,
  syncedToSheets: true,
  syncedAt: Timestamp
}
```

### Google Sheets Row Structure
```
| Timestamp           | Full Name | Email           | Grade Level | Interests                               | Entry ID    |
|---------------------|-----------|-----------------|-------------|----------------------------------------|-------------|
| 2025-01-15T10:30:00 | John Doe  | john@example.com| 11th Grade  | Computer Science, Engineering, Business | abc123xyz   |
```

## Security Considerations

- **Never commit** the service account JSON key to Git
- Store the JSON key securely (use Firebase environment config)
- The service account should only have access to the specific spreadsheet
- Consider implementing authentication for the `resyncWaitlistToSheets` function
- Review who has access to your Google Sheet regularly

## Maintenance

### Updating the Sheet Structure

If you need to change the columns in the Google Sheet:

1. Update the sheet headers manually
2. Modify the `rowData` array in `functions/triggers/waitlistSync.js`:

```javascript
const rowData = [
    timestamp,
    waitlistData.fullName || '',
    waitlistData.email || '',
    waitlistData.gradeLevel || '',
    interests,
    waitlistId,
    // Add new fields here
];
```

3. Update the range in the append call:
```javascript
range: 'Sheet1!A:G', // Change F to G if adding a column
```

4. Redeploy the function:
```bash
firebase deploy --only functions:onWaitlistEntryCreated
```

## Cost Considerations

- **Firestore**: Charged per document read/write (~$0.06 per 100k operations)
- **Cloud Functions**: Charged per invocation and compute time (~$0.40 per million invocations)
- **Google Sheets API**: Free for up to 500 requests per 100 seconds per project

For a waitlist, costs should be minimal unless you have thousands of signups per day.

## Support

If you encounter issues:
1. Check the Firebase Functions logs
2. Verify all environment variables are set correctly
3. Test with a simple entry first
4. Check the GitHub issues for common problems
