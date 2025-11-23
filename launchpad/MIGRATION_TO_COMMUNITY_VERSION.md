# Migration to Community Version - Complete Documentation

## Overview

This document details the complete transformation of the Launchpad platform from a school-centric, multi-tenant architecture (designed for Awty International School) to an open community version. This migration removes security features like parent verification and tenant isolation while preserving core functionality.

## Table of Contents

1. [Architecture Changes](#architecture-changes)
2. [Database Schema Changes](#database-schema-changes)
3. [Backend Changes](#backend-changes)
4. [Frontend Changes](#frontend-changes)
5. [Security Rules Changes](#security-rules-changes)
6. [Deployment Guide](#deployment-guide)
7. [Data Migration](#data-migration)

---

## Architecture Changes

### Original Architecture (School Version)
- **Multi-tenant**: Database structured as `tenants/{schoolId}/collections`
- **Custom Claims**: Firebase Auth custom claims for school assignment
- **Parent Verification**: Email-based parental consent system for high school students
- **Connection Restrictions**: User type-based connection limitations
- **School Email Validation**: Restrictive signup requiring school email domains
- **Private Keys**: School-specific private keys for signup validation

### New Architecture (Community Version)
- **Flat Collections**: Database structured as root-level collections (`users`, `connections`, `opportunities`)
- **No Custom Claims**: Removed school assignment from Firebase Auth
- **No Parent Verification**: Direct connection approval without parental consent
- **Open Connections**: All user types can connect freely
- **Basic Email Validation**: Standard email format validation only
- **No Signup Restrictions**: Open signup without school verification

---

## Database Schema Changes

### Users Collection

**Before (School Version)**:
```
tenants/{schoolId}/users/{userId}
{
  userName: string,
  userType: "High Schooler" | "Alumni" | "Professional" | "Staff",
  schoolId: string,
  parentEmail: string,          // For High Schoolers
  parentVerified: boolean,      // Parental consent status
  verificationToken: string,    // Email verification token
  tokenExpiration: timestamp,   // Token expiry
  // ... other fields
}
```

**After (Community Version)**:
```
users/{userId}
{
  userName: string,
  userType: "High Schooler" | "College Student" | "Professional" | "Staff",
  // Removed: schoolId, parentEmail, parentVerified, verificationToken, tokenExpiration
  // ... other fields
}
```

### Connections Collection

**Before (School Version)**:
```
tenants/{schoolId}/connections/{connectionId}
{
  initiateUserId: string,
  targetUserId: string,
  status: "pending" | "pending_parental_approval" | "parent_approved" | "approved",
  schoolId: string,
  needsParentalApproval: boolean,
  createdAt: timestamp
}
```

**After (Community Version)**:
```
connections/{connectionId}
{
  initiateUserId: string,
  targetUserId: string,
  status: "pending" | "approved",
  role: "initiator" | "target",
  createdAt: timestamp
}
```

### Opportunities Collection

**Before (School Version)**:
```
tenants/{schoolId}/opportunities/{opportunityId}
{
  title: string,
  createdBy: string,
  schoolId: string,
  // ... other fields
}
```

**After (Community Version)**:
```
opportunities/{opportunityId}
{
  title: string,
  createdBy: string,
  // Removed: schoolId
  // ... other fields
}
```

### Removed Collections
- `school_configs` - Contained school metadata, private keys, email domains

---

## Backend Changes

### Cloud Functions

#### 1. `functions/callableFunctions/manageConnections.js`

**Key Changes**:
- Removed `schoolId` parameter from all functions
- Changed collection path from `db.collection('tenants').doc(schoolId).collection('connections')` to `db.collection('connections')`
- Removed parent approval logic
- Simplified connection status from 4 states to 2 states

**Before**:
```javascript
async function createConnection(currentUserId, targetUserId, status, schoolId, needsParentalApproval) {
    const connectionRef = db.collection('tenants').doc(schoolId).collection('connections').doc();
    const connectionData = {
        initiateUserId: currentUserId,
        targetUserId: targetUserId,
        status: needsParentalApproval ? 'pending_parental_approval' : status,
        schoolId: schoolId,
        needsParentalApproval: needsParentalApproval,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await connectionRef.set(connectionData);
}
```

**After**:
```javascript
// COMMUNITY VERSION: Removed schoolId and parent approval logic
async function createConnection(currentUserId, targetUserId, status) {
    const connectionRef = db.collection('connections').doc();
    const connectionData = {
        initiateUserId: currentUserId,
        targetUserId: targetUserId,
        status: status,
        role: 'initiator',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await connectionRef.set(connectionData);

    // Create reciprocal connection entry
    const reciprocalRef = db.collection('connections').doc();
    await reciprocalRef.set({
        ...connectionData,
        initiateUserId: targetUserId,
        targetUserId: currentUserId,
        role: 'target'
    });
}
```

#### 2. `functions/callableFunctions/sendEmailNotifications.js`

**Before**:
```javascript
const userDoc = await admin.firestore()
    .collection('tenants')
    .doc(schoolId)
    .collection('users')
    .doc(receiverId)
    .get();
```

**After**:
```javascript
// COMMUNITY VERSION: Removed tenant-based architecture
const userDoc = await admin.firestore()
    .collection('users')
    .doc(receiverId)
    .get();
```

#### 3. `functions/index.js`

**Commented Out Functions**:
```javascript
// COMMUNITY VERSION: Removed school claim export
// exports.createSchoolClaim = createSchoolClaim;

// COMMUNITY VERSION: Removed parent verification exports
// exports.generateVerificationLink = generateVerificationLink;
// exports.verifyParentToken = verifyParentToken;

// COMMUNITY VERSION: Removed graduation/migration email exports
// exports.sendGraduationEmails = sendGraduationEmails;
// exports.migrateAlumniToTenants = migrateAlumniToTenants;
```

---

## Frontend Changes

### Services Layer

#### 1. `src/services/onboardingServices.jsx`

**All save functions updated**:

**Before**:
```javascript
export const saveHighSchooler = async (currentUser, highSchoolerData, onSuccess) => {
    const schoolId = currentUser.schoolId;
    const dataToSave = {
        ...otherData,
        parentEmail: parentEmailToSave,
        parentVerified: false,
        schoolId: schoolId,
        userId: currentUser.uid,
    };
    const docRef = await setDoc(
        doc(db, 'tenants', schoolId, 'users', currentUser.uid),
        dataToSave
    );
}
```

**After**:
```javascript
export const saveHighSchooler = async (currentUser, highSchoolerData, onSuccess) => {
    // COMMUNITY VERSION: Removed parent verification fields
    const dataToSave = {
        ...otherData,
        userPfpPreview: pfpURL,
        userResumePreview: resumeURL,
        userId: currentUser.uid,
    };
    // COMMUNITY VERSION: Removed tenant-based architecture
    const docRef = await setDoc(doc(db, 'users', currentUser.uid), dataToSave);
}
```

#### 2. `src/services/connectionService.jsx`

**Key Changes**:
- Removed all `schoolId` parameters
- Removed user type restrictions
- Simplified `isConnectionApproved` function

**Before**:
```javascript
export const checkConnection = async (targetUserId, schoolId) => {
    try {
        const result = await manageConnections({
            action: 'check',
            targetUserId,
            schoolId
        });
        return result.data;
    } catch (error) {
        console.error('Error checking connection:', error);
        throw error;
    }
};

export function isConnectionApproved(currentUserType, currentUser, targetUser, approved, parentApproved) {
    if (!currentUser || !targetUser) return false;

    // High Schoolers cannot connect with Alumni in school version
    if (currentUserType === "High Schooler" && targetUser.userType === "Alumni") {
        return false;
    }

    // Check parent approval for High Schoolers
    if (currentUserType === "High Schooler") {
        return parentApproved.some(conn =>
            (conn.initiateUserId === currentUser.uid && conn.targetUserId === targetUser.id) ||
            (conn.initiateUserId === targetUser.id && conn.targetUserId === currentUser.uid)
        );
    }

    return approved.some(conn =>
        (conn.initiateUserId === currentUser.uid && conn.targetUserId === targetUser.id) ||
        (conn.initiateUserId === targetUser.id && conn.targetUserId === currentUser.uid)
    );
}
```

**After**:
```javascript
// COMMUNITY VERSION: Removed schoolId parameter
export const checkConnection = async (targetUserId) => {
    try {
        const result = await manageConnections({
            action: 'check',
            targetUserId
        });
        return result.data;
    } catch (error) {
        console.error('Error checking connection:', error);
        throw error;
    }
};

// COMMUNITY VERSION: Removed all user type restrictions and parent verification
export function isConnectionApproved(currentUserType, currentUser, targetUser, approved) {
    if (!currentUser || !targetUser) return false;

    // All users can connect with each other in the community version
    return approved.some(conn =>
        (conn.initiateUserId === currentUser.uid && (conn.targetUserId === targetUser.id || conn.targetUserId === targetUser.userId)) ||
        (conn.initiateUserId === (targetUser.id || targetUser.userId) && conn.targetUserId === currentUser.uid)
    );
}
```

#### 3. `src/services/userProfileServices.jsx`

**Alumni → College Student Refactoring**:

**Before**:
```javascript
export const getBasicUserDescription = (userData, shortened=true) => {
    return userData.userType === "High Schooler" ?
     `Class of ${userData.graduationYear || 'N/A'}, ${getUserHS(userData.schoolAttending || 'Unknown School')}`
     : userData.userType === "Alumni" ? `Alumni, Class of ${userData.graduationYear || 'N/A'}`
     : userData.userType === "Professional" ? `${userData.yearsOfExperience || 'N/A'}+ Years of Experience...`
    : `${userData.schoolRole || 'Staff Member'}`;
}
```

**After**:
```javascript
export const getBasicUserDescription = (userData, shortened=true) => {
    return userData.userType === "High Schooler" ?
     `Class of ${userData.graduationYear || 'N/A'}, ${getUserHS(userData.schoolAttending || 'Unknown School')}`
     : userData.userType === "College Student" ? `${userData.collegeAttending || 'College Student'}, Class of ${userData.graduationYear || 'N/A'}`
     : userData.userType === "Professional" ? `${userData.yearsOfExperience || 'N/A'}+ Years of Experience...`
    : `${userData.schoolRole || 'Staff Member'}`;
}
```

#### 4. `src/services/opportunityServices.jsx`

**Before**:
```javascript
export const saveOpportunity = async (opportunityData, organizationLogo, currentUser, isEditing, opportunityId) => {
  const schoolId = currentUser.schoolId;
  const opportunitiesCollectionRef = collection(db, "tenants", schoolId, "opportunities");
  // ...
}
```

**After**:
```javascript
export const saveOpportunity = async (opportunityData, organizationLogo, currentUser, isEditing, opportunityId) => {
  // COMMUNITY VERSION: Removed tenant-based architecture
  const opportunitiesCollectionRef = collection(db, "opportunities");
  // ...
}
```

#### 5. `src/services/filteringServices.jsx`

**Before**:
```javascript
export async function getFilteredData(collectionName, filters, currentUserId, schoolId, category = null, lastDoc = null, maxLimit = 6) {
    let q = collection(db, "tenants", schoolId, collectionName);
    // ...
}
```

**After**:
```javascript
export async function getFilteredData(collectionName, filters, currentUserId, category = null, lastDoc = null, maxLimit = 6) {
    // COMMUNITY VERSION: Removed tenant-based architecture
    let q = collection(db, collectionName);
    // ...
}
```

### Contexts

#### 1. `src/contexts/GlobalAuthWrapper.jsx`

**Key Changes**:
- Removed custom claims retrieval
- Removed parent approval states
- Updated user document path

**Before**:
```javascript
const getUserTokenInfo = useCallback(async () => {
    if (!user) return null;
    const tokenResult = await user.getIdTokenResult(true);
    return tokenResult.claims;
}, [user]);

useEffect(() => {
    const initializeUser = async () => {
        const claims = await getUserTokenInfo();
        const schoolId = claims?.school_id;

        if (!schoolId) {
            navigate("/Onboarding");
            return;
        }

        setSchoolId(schoolId);
        const userRef = doc(db, 'tenants', schoolId, 'users', currentUser.uid);
        // ...
    };
    initializeUser();
}, [currentUser]);

const {
    pending,
    approved,
    parentApproved,
    pendingParentalApproval,
    incomingRequests,
    loading: connectionsLoading,
    refetchConnections,
} = useConnections();
```

**After**:
```javascript
// COMMUNITY VERSION: Removed getUserTokenInfo (no longer needed without custom claims)

useEffect(() => {
    const initializeUser = async () => {
        if (!currentUser) {
            navigate("/Login");
            return;
        }

        try {
            // COMMUNITY VERSION: Removed tenant-based architecture and custom claims
            console.log("Initializing user UID: ", currentUser.uid);
            const userRef = doc(db, 'users', currentUser.uid);
            // ...
        } catch (error) {
            console.error("Error initializing user:", error);
            navigate("/Onboarding");
        }
    };
    initializeUser();
}, [currentUser, isConnected, connectToStream, loading, fetchAndStoreConnections, navigate]);

// COMMUNITY VERSION: Removed parent approval states
const {
    pending,
    approved,
    incomingRequests,
    loading: connectionsLoading,
    refetchConnections,
} = useConnections();
```

#### 2. `src/contexts/ConnectionContext.jsx`

**Before**:
```javascript
const [connections, setConnections] = useState({
    pending: [],
    approved: [],
    parentApproved: [],
    pendingParentalApproval: [],
    incomingRequests: [],
});

const fetchAllConnections = async () => {
    setLoading(true);
    const statuses = ["pending", "approved", "parent_approved", "pending_parental_approval"];
    const results = await Promise.all(
      statuses.map((status) => getConnectionsByStatus(status))
    );
    // ...
};
```

**After**:
```javascript
// COMMUNITY VERSION: Removed parent approval states
const [connections, setConnections] = useState({
    pending: [],
    approved: [],
    incomingRequests: [],
});

const fetchAllConnections = async () => {
    setLoading(true);
    // COMMUNITY VERSION: Simplified to only pending and approved
    const statuses = ["pending", "approved"];
    const results = await Promise.all(
      statuses.map((status) => getConnectionsByStatus(status))
    );
    // ...
};
```

### Components

#### 1. `src/pages/Onboarding/Onboarding.jsx`

**Key Changes**:
- Removed school validation
- Removed custom claims setup
- Fixed Alumni → College Student conversion

**Before**:
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate school before submission
    const schoolInfo = await fetchSchoolInfo(selectedSchool);
    if (!schoolInfo) {
        toast.error("Invalid school selected");
        return;
    }

    const currentUserData = {
        ...userData,
        userType: selectedOption === "College Student" ? "Alumni" : selectedOption,
        schoolId: schoolInfo.schoolId,
    };

    // Set custom claim for school
    await setCustomClaim(currentUser.uid, schoolInfo.schoolId);

    // ...
};
```

**After**:
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();

    // COMMUNITY VERSION: Removed school validation and custom claims setup
    const currentUserData = {
        ...userData,
        userType: selectedOption, // No conversion to Alumni
    };

    // ...
};
```

#### 2. `src/pages/Onboarding/CollegeStudent/CollegeStudent.jsx`

**Before**:
```javascript
const [collegeStudentData, setCollegeStudentData] = useState({
    userName: "",
    userPfp: null,
    userPfpPreview: null,
    areasOfInterest: [],
    linkedinLink: "",
    email: "",
    schoolAttending: "",
    collegeAttending: "",
    graduationYear: "",
    userSkills: [],
    userType: "Alumni",
});
```

**After**:
```javascript
const [collegeStudentData, setCollegeStudentData] = useState({
    userName: "",
    userPfp: null,
    userPfpPreview: null,
    areasOfInterest: [],
    linkedinLink: "",
    email: "",
    schoolAttending: "",
    collegeAttending: "",
    graduationYear: "",
    userSkills: [],
    userType: "College Student", // Changed from "Alumni"
});
```

#### 3. `src/pages/Authentication/Signup.jsx`

**Key Changes**:
- Removed school email validation
- Removed private key validation
- Simplified to basic email format check

**Before**:
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate school email
    const schoolInfo = await fetchSchoolInfo(selectedSchool);
    const emailDomain = userEmail.split('@')[1];

    if (!schoolInfo.allowedDomains.includes(emailDomain)) {
        toast.error('Please use a valid school email address');
        return;
    }

    // Validate private key
    if (privateKey !== schoolInfo.privateKey) {
        toast.error('Invalid private key for this school');
        return;
    }

    // Create user with school email
    const userCredential = await doCreateUserWithEmailAndPassword(userEmail, userPassword);

    // Set custom claim
    await setCustomClaim(userCredential.user.uid, schoolInfo.schoolId);
};
```

**After**:
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    // COMMUNITY VERSION: Simplified - removed all school-specific validation

    // Basic email format validation
    const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailPattern.test(userEmail)) {
        toast.error('Please enter a valid email address.');
        return;
    }

    // Password strength validation
    if (userPassword.length < 6) {
        toast.error('Password must be at least 6 characters.');
        return;
    }

    if (userPassword !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
    }

    // Create user directly
    const userCredential = await toast.promise(
        doCreateUserWithEmailAndPassword(userEmail, userPassword),
        {
            loading: 'Creating account...',
            success: 'Account created successfully!',
            error: (err) => `Signup failed: ${err.message}`
        }
    );
};
```

#### 4. `src/pages/Settings/sections/AccountSettings.jsx`

**Before**:
```javascript
const handleExportData = async () => {
    const schoolId = currentUser.schoolId;
    const userDoc = await getDoc(doc(db, "tenants", schoolId, "users", currentUser.uid));
    // ...
};

const handleDeleteAccount = async () => {
    const schoolId = currentUser.schoolId;
    const userDoc = doc(db, "tenants", schoolId, "users", currentUser.uid);
    await deleteDoc(userDoc);
    // ...
};
```

**After**:
```javascript
const handleExportData = async () => {
    // COMMUNITY VERSION: Removed tenant-based architecture
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    // ...
};

const handleDeleteAccount = async () => {
    // COMMUNITY VERSION: Removed tenant-based architecture
    const userDoc = doc(db, "users", currentUser.uid);
    await deleteDoc(userDoc);
    // ...
};
```

#### 5. `src/pages/Homepage/Home.jsx`

**Before**:
```javascript
const getUserData = async () => {
    const schoolId = currentUser.schoolId;
    const userDocRef = doc(db, 'tenants', schoolId, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    const data = userDoc.data();

    // Check parent verification status
    if (data.userType === "High Schooler" && !data.parentVerified) {
        setShowParentVerification(true);
    }
};

const onUpdateParentEmail = async (newEmail) => {
    await updateDoc(doc(db, 'tenants', schoolId, 'users', currentUser.uid), {
        parentEmail: newEmail
    });
    await sendVerificationEmail(newEmail);
};
```

**After**:
```javascript
const getUserData = async () => {
    // COMMUNITY VERSION: Removed tenant-based architecture
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    const data = userDoc.data();

    // COMMUNITY VERSION: Removed parent verification check
};

// COMMUNITY VERSION: Commented out parent verification functions
// const onUpdateParentEmail = async (newEmail) => { ... }
// const onParentVerificationResend = async () => { ... }
```

---

## Security Rules Changes

### OLD Firestore Rules (School Version)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // School configurations - only admins can modify
    match /school_configs/{schoolId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.token.admin == true;
    }

    // Tenant-based user data
    match /tenants/{schoolId}/users/{userId} {
      // Must be authenticated and belong to same school
      allow read: if request.auth != null &&
        request.auth.token.school_id == schoolId;

      // Can only write own data and must belong to school
      allow create, update, delete: if request.auth != null &&
        request.auth.uid == userId &&
        request.auth.token.school_id == schoolId;
    }

    // Tenant-based connections
    match /tenants/{schoolId}/connections/{connectionId} {
      // Must be authenticated and belong to same school
      allow read: if request.auth != null &&
        request.auth.token.school_id == schoolId &&
        (request.auth.uid == resource.data.initiateUserId ||
         request.auth.uid == resource.data.targetUserId);

      // Can create connection if authenticated and in same school
      allow create: if request.auth != null &&
        request.auth.token.school_id == schoolId &&
        request.auth.uid == request.resource.data.initiateUserId;

      // Can update/delete if part of connection and in same school
      allow update, delete: if request.auth != null &&
        request.auth.token.school_id == schoolId &&
        (request.auth.uid == resource.data.initiateUserId ||
         request.auth.uid == resource.data.targetUserId);
    }

    // Tenant-based opportunities
    match /tenants/{schoolId}/opportunities/{opportunityId} {
      // Must be authenticated and belong to same school
      allow read: if request.auth != null &&
        request.auth.token.school_id == schoolId;

      // Can create if authenticated and in same school
      allow create: if request.auth != null &&
        request.auth.token.school_id == schoolId &&
        request.auth.uid == request.resource.data.createdBy;

      // Can update/delete own opportunities
      allow update, delete: if request.auth != null &&
        request.auth.token.school_id == schoolId &&
        request.auth.uid == resource.data.createdBy;
    }

    // Parent verification tokens
    match /parent_verification/{tokenId} {
      allow read: if true; // Public read for email verification
      allow write: if request.auth != null;
    }
  }
}
```

### NEW Firestore Rules (Community Version)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection - flat structure (no tenant nesting)
    match /users/{userId} {
      // Any authenticated user can read any profile (community-wide visibility)
      allow read: if isAuthenticated();

      // Users can only create, update, or delete their own profile
      allow create, update, delete: if isAuthenticated() && isOwner(userId);
    }

    // Connections collection - flat structure
    match /connections/{connectionId} {
      // Users can read connections where they are either initiator or target
      allow read: if isAuthenticated() &&
        (isOwner(resource.data.initiateUserId) ||
         isOwner(resource.data.targetUserId));

      // Users can create connections where they are the initiator
      allow create: if isAuthenticated() &&
        isOwner(request.resource.data.initiateUserId);

      // Users can update or delete connections where they are involved
      allow update, delete: if isAuthenticated() &&
        (isOwner(resource.data.initiateUserId) ||
         isOwner(resource.data.targetUserId));
    }

    // Opportunities collection - flat structure
    match /opportunities/{opportunityId} {
      // Any authenticated user can read any opportunity
      allow read: if isAuthenticated();

      // Users can only create opportunities they own
      allow create: if isAuthenticated() &&
        isOwner(request.resource.data.createdBy);

      // Users can only update or delete their own opportunities
      allow update, delete: if isAuthenticated() &&
        isOwner(resource.data.createdBy);
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Key Differences in Security Rules

1. **Removed Collections**:
   - `school_configs` - No longer needed
   - `parent_verification` - Removed parent verification system
   - All `tenants/{schoolId}/` nested paths

2. **Removed Custom Claims Checks**:
   - All `request.auth.token.school_id` checks removed
   - No admin role checks

3. **Visibility Changes**:
   - **Before**: Users could only see other users in their school
   - **After**: Any authenticated user can see any profile (community-wide)

4. **Simplified Permissions**:
   - Removed school-based isolation
   - Maintained ownership-based write permissions
   - Added helper functions for cleaner rules

---

## Deployment Guide

### Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Admin access to Firebase console

### Step 1: Update Firebase Functions

1. Navigate to functions directory:
```bash
cd functions
```

2. Install dependencies:
```bash
npm install
```

3. Deploy functions:
```bash
firebase deploy --only functions
```

4. Verify deployment in Firebase Console > Functions

### Step 2: Update Firestore Security Rules

1. Copy the NEW Firestore rules from above

2. Deploy via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

OR

3. Update manually in Firebase Console:
   - Go to Firebase Console > Firestore Database > Rules
   - Paste the new rules
   - Click "Publish"

### Step 3: Update Frontend Environment

1. Ensure `.env` file has correct Firebase config:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

2. Build frontend:
```bash
npm run build
```

3. Deploy to hosting:
```bash
firebase deploy --only hosting
```

### Step 4: Verify Deployment

1. Test signup flow (no school email restriction)
2. Test connection creation (no parent approval)
3. Test opportunity creation
4. Verify Stream Chat integration
5. Check that data is being written to flat collections

---

## Data Migration

### Migration Strategy

If you have existing data in the school version tenant structure, you'll need to migrate it to the flat structure.

### Migration Script (Python Example)

```python
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase Admin SDK
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def migrate_users(school_id):
    """Migrate users from tenant structure to flat structure"""
    print(f"Migrating users for school: {school_id}")

    # Get all users from old structure
    old_users_ref = db.collection('tenants').document(school_id).collection('users')
    users = old_users_ref.stream()

    migrated_count = 0
    for user in users:
        user_data = user.to_dict()
        user_id = user.id

        # Remove school-specific fields
        fields_to_remove = [
            'schoolId',
            'parentEmail',
            'parentVerified',
            'verificationToken',
            'tokenExpiration'
        ]
        for field in fields_to_remove:
            user_data.pop(field, None)

        # Update Alumni to College Student
        if user_data.get('userType') == 'Alumni':
            user_data['userType'] = 'College Student'

        # Write to new flat structure
        db.collection('users').document(user_id).set(user_data)
        migrated_count += 1
        print(f"Migrated user: {user_id}")

    print(f"Total users migrated: {migrated_count}")

def migrate_connections(school_id):
    """Migrate connections from tenant structure to flat structure"""
    print(f"Migrating connections for school: {school_id}")

    # Get all connections from old structure
    old_connections_ref = db.collection('tenants').document(school_id).collection('connections')
    connections = old_connections_ref.stream()

    migrated_count = 0
    for connection in connections:
        conn_data = connection.to_dict()

        # Remove school-specific fields
        conn_data.pop('schoolId', None)
        conn_data.pop('needsParentalApproval', None)

        # Update status mapping
        status_mapping = {
            'pending_parental_approval': 'pending',
            'parent_approved': 'approved',
            'pending': 'pending',
            'approved': 'approved'
        }
        conn_data['status'] = status_mapping.get(conn_data.get('status'), 'pending')

        # Add role field
        conn_data['role'] = 'initiator'

        # Write to new flat structure
        db.collection('connections').add(conn_data)
        migrated_count += 1
        print(f"Migrated connection: {connection.id}")

    print(f"Total connections migrated: {migrated_count}")

def migrate_opportunities(school_id):
    """Migrate opportunities from tenant structure to flat structure"""
    print(f"Migrating opportunities for school: {school_id}")

    # Get all opportunities from old structure
    old_opps_ref = db.collection('tenants').document(school_id).collection('opportunities')
    opportunities = old_opps_ref.stream()

    migrated_count = 0
    for opp in opportunities:
        opp_data = opp.to_dict()

        # Remove school-specific fields
        opp_data.pop('schoolId', None)

        # Write to new flat structure
        db.collection('opportunities').add(opp_data)
        migrated_count += 1
        print(f"Migrated opportunity: {opp.id}")

    print(f"Total opportunities migrated: {migrated_count}")

# Run migration
if __name__ == '__main__':
    SCHOOL_ID = 'awty'  # Replace with your school ID

    print("Starting migration...")
    migrate_users(SCHOOL_ID)
    migrate_connections(SCHOOL_ID)
    migrate_opportunities(SCHOOL_ID)
    print("Migration complete!")
```

### Migration Steps

1. **Backup existing data**:
```bash
# Export all data from Firebase
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
```

2. **Run migration script**:
```bash
python migrate_to_community.py
```

3. **Verify migration**:
   - Check user counts match
   - Verify connections are preserved
   - Check opportunities exist
   - Test a few user logins

4. **Clean up old data** (optional, after verification):
```javascript
// Delete old tenant structure
const schoolId = 'awty';
const batch = db.batch();

// Delete users
const usersSnapshot = await db.collection('tenants').doc(schoolId).collection('users').get();
usersSnapshot.forEach(doc => batch.delete(doc.ref));

// Delete connections
const connectionsSnapshot = await db.collection('tenants').doc(schoolId).collection('connections').get();
connectionsSnapshot.forEach(doc => batch.delete(doc.ref));

// Delete opportunities
const oppsSnapshot = await db.collection('tenants').doc(schoolId).collection('opportunities').get();
oppsSnapshot.forEach(doc => batch.delete(doc.ref));

await batch.commit();
```

---

## Testing Checklist

### Authentication
- [ ] Email/password signup works without school email validation
- [ ] Google OAuth signup works
- [ ] Login redirects to correct pages
- [ ] Logout clears session properly

### Onboarding
- [ ] High Schooler onboarding saves to flat `users` collection
- [ ] College Student onboarding (not Alumni) saves correctly
- [ ] Professional onboarding works
- [ ] Staff onboarding works
- [ ] No parent email fields appear
- [ ] Profile images upload correctly

### Connections
- [ ] Users can send connection requests
- [ ] Connection status updates to "pending" immediately
- [ ] Connection approval works
- [ ] No parent approval workflow appears
- [ ] High Schoolers can connect with College Students
- [ ] All user types can connect freely

### Opportunities
- [ ] Opportunities save to flat collection
- [ ] Opportunity listings display correctly
- [ ] Opportunity filtering works
- [ ] Users can create/edit/delete their own opportunities

### Profile
- [ ] User profiles load correctly
- [ ] Profile editing saves to correct location
- [ ] Profile images display
- [ ] College Student displays correctly (not Alumni)

### Stream Chat
- [ ] Chat initialization works
- [ ] Users can send messages
- [ ] Message notifications work
- [ ] Chat history persists

### Security
- [ ] Users can only edit their own profiles
- [ ] Users can only delete their own opportunities
- [ ] Connection permissions work correctly
- [ ] No unauthorized access to data

---

## Rollback Plan

If issues arise, you can rollback:

1. **Restore Firebase Functions**:
```bash
# Checkout previous version
git checkout <previous-commit-hash>
cd functions
firebase deploy --only functions
```

2. **Restore Firestore Rules**:
   - Go to Firebase Console > Firestore > Rules > History
   - Select previous version and restore

3. **Restore Data** (if migration was performed):
```bash
# Import from backup
firebase firestore:import gs://your-bucket/backups/<backup-date>
```

---

## Summary of Changes

### Removed Features
- ❌ Multi-tenant architecture (tenants/{schoolId}/)
- ❌ Parent verification system
- ❌ Custom claims for school assignment
- ❌ School email validation
- ❌ Private key validation
- ❌ Connection restrictions by user type
- ❌ Parent approval workflow (4-state → 2-state connections)
- ❌ School configurations collection

### Preserved Features
- ✅ All 4 user types (High Schooler, College Student, Professional, Staff)
- ✅ Stream Chat integration
- ✅ Opportunities/Organizations system
- ✅ Connection system (simplified)
- ✅ Profile management
- ✅ Email/password and Google OAuth authentication
- ✅ User filtering and search

### Terminology Changes
- "Alumni" → "College Student" (throughout codebase)

### Architecture Changes
- Flat database collections instead of nested tenant structure
- Community-wide visibility instead of school-based isolation
- Simplified connection workflow
- Removed custom claims dependency

---

## Contact & Support

For questions about this migration:
- Review this document thoroughly
- Check git history for specific changes
- Test in a development environment before production deployment

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Migration Target**: Launchpad Community Version
