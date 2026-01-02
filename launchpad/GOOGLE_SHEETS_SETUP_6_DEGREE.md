# Google Sheets Setup for 6 Degree Applications

This guide explains how to set up automatic syncing of 6 Degree Mentor Application submissions to Google Sheets.

## How It Works

- When a user submits an application form, the data is automatically sent to a Google Sheet
- The **resume PDF is not embedded** - instead, a **clickable Firebase Storage URL** is included in the sheet
- Reviewers can click the link to view/download the resume
- Both PATH 1 (Existing Mentor) and PATH 2 (New Mentor) submissions are handled

## Google Sheet Structure

The sheet will have the following columns (A through M):

| Column | Header | Description |
|--------|--------|-------------|
| A | Timestamp | When the application was submitted |
| B | Name | Applicant's name |
| C | Email | Applicant's email |
| D | Path | "Existing Mentor" or "New Mentor" |
| E | Mentor | Selected mentor (PATH 1 only, N/A for PATH 2) |
| F | Work Description | What they want to work on |
| G | Why This Mentor | Why interested in mentor (PATH 1 only, N/A for PATH 2) |
| H | Existing Materials | Materials they have (PATH 1 only, N/A for PATH 2) |
| I | Resume URL | **Clickable link** to resume in Firebase Storage |
| J | Academic Interests | Comma-separated list of interests |
| K | New Resume | "Yes" if they uploaded a new resume, "No" if using existing |
| L | User ID | Firebase User ID |
| M | Application ID | Unique application document ID |

## Setup Instructions

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "6 Degree Mentor Applications" (or whatever you prefer)
4. Add headers to the first row (optional but recommended):
   ```
   Timestamp | Name | Email | Path | Mentor | Work Description | Why This Mentor | Existing Materials | Resume URL | Academic Interests | New Resume | User ID | Application ID
   ```
5. Copy the **Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Example ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Step 2: Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project (or create one if needed)
3. Go to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**
5. Name it "firebase-sheets-sync" (or similar)
6. Click **Create and Continue**
7. Grant the role: **Service Account Token Creator** (optional, can skip)
8. Click **Done**

### Step 3: Enable Google Sheets API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click on it and press **Enable**

### Step 4: Create and Download Service Account Key

1. Go back to **IAM & Admin** > **Service Accounts**
2. Find your service account and click on it
3. Go to the **Keys** tab
4. Click **Add Key** > **Create New Key**
5. Choose **JSON** format
6. Click **Create** - this will download a JSON file
7. **Keep this file secure** - it contains credentials

### Step 5: Share Google Sheet with Service Account

1. Open the JSON file you downloaded
2. Find the `client_email` field (looks like `firebase-sheets-sync@your-project.iam.gserviceaccount.com`)
3. Copy this email address
4. Go to your Google Sheet
5. Click **Share** (top right)
6. Paste the service account email
7. Give it **Editor** access
8. Uncheck "Notify people"
9. Click **Share**

### Step 6: Configure Firebase Functions

You need to set two environment variables in Firebase:

#### Option A: Using Firebase CLI

```bash
cd functions

# Set the spreadsheet ID
firebase functions:config:set google.sheets.applications_spreadsheet_id="YOUR_SPREADSHEET_ID"

# Set the service account credentials (paste the entire JSON file contents)
firebase functions:config:set google.service_account='PASTE_ENTIRE_JSON_HERE'
```

**Note:** When pasting the JSON, make sure it's properly escaped. You can use:
```bash
firebase functions:config:set google.service_account="$(cat path/to/service-account-key.json)"
```

#### Option B: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Functions** > **Configuration**
4. Add these config variables:
   - Key: `google.sheets.applications_spreadsheet_id`
   - Value: Your spreadsheet ID
   - Key: `google.service_account`
   - Value: Paste the entire JSON service account key

### Step 7: Deploy the Functions

```bash
cd functions
firebase deploy --only functions:onSixDegreeApplicationCreated,functions:resyncSixDegreeApplicationsToSheets
```

Or deploy all functions:
```bash
firebase deploy --only functions
```

## Verify Setup

After deployment:

1. Submit a test application through the form
2. Check your Google Sheet - a new row should appear within seconds
3. Click the Resume URL to verify it opens the resume
4. Check the Firebase Functions logs if there are any issues:
   ```bash
   firebase functions:log
   ```

## Troubleshooting

### No data appearing in Google Sheet

1. Check Firebase Functions logs:
   ```bash
   firebase functions:log --only onSixDegreeApplicationCreated
   ```

2. Verify the service account has Editor access to the sheet

3. Check that environment variables are set correctly:
   ```bash
   firebase functions:config:get
   ```

4. Make sure Google Sheets API is enabled in Google Cloud Console

### Resume URL not working

- The URL should be a Firebase Storage URL (starts with `https://firebasestorage.googleapis.com`)
- If the resume was already on file, the URL will be the existing one
- If a new resume was uploaded, make sure the upload completed successfully

### Manual Resync

If some applications failed to sync, you can manually trigger a resync:

1. Create a callable function trigger in your frontend:
   ```javascript
   import { getFunctions, httpsCallable } from 'firebase/functions';

   const functions = getFunctions();
   const resync = httpsCallable(functions, 'resyncSixDegreeApplicationsToSheets');

   const result = await resync();
   console.log(result.data.message); // "Re-synced X application entries"
   ```

2. Or use Firebase Console to manually call the function

## Security Notes

- **Never commit** the service account JSON file to version control
- Keep the service account credentials secure
- Only share the Google Sheet with necessary people
- The service account only has access to sheets you explicitly share with it

## Additional Tips

### Adding Formulas

You can add formulas to your sheet for analysis:
- Count applications by path: `=COUNTIF(D:D,"Existing Mentor")`
- Count by mentor: `=COUNTIF(E:E,"Charles Calomiris")`
- Latest submission: `=MAX(A:A)`

### Making Resume Links Clickable

Google Sheets should automatically make URLs clickable, but if not:
1. Select column I (Resume URL)
2. Format > Number > Plain text
3. The links should become clickable

### Filtering and Sorting

- Use Google Sheets built-in filtering to filter by path, mentor, or interests
- Sort by timestamp to see most recent applications first

## Using the Same Service Account for Both Sheets

If you already set up the waitlist sync, you can reuse the same service account:

1. You already have `google.service_account` configured
2. Just add the new spreadsheet ID:
   ```bash
   firebase functions:config:set google.sheets.applications_spreadsheet_id="YOUR_NEW_SHEET_ID"
   ```
3. Share the new sheet with the same service account email
4. Deploy the function

This way both the waitlist and applications use the same authentication.
