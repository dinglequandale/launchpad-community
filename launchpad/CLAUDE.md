# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Launchpad is a React-based community networking platform built with Firebase, Vite, and Stream Chat. It connects high schoolers, college students, professionals, and staff members in a single-tenant community architecture.

**Important Context**: This codebase was recently migrated from a multi-tenant school-based architecture to a single-tenant community version. Many comments reference the "COMMUNITY VERSION" migration. See `MIGRATION_TO_COMMUNITY_VERSION.md` for complete migration details.

## Development Commands

### Frontend Development
```bash
# Development server (runs on port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Populate Typesense search index
npm run populate
```

### Firebase Functions
```bash
cd functions

# Install dependencies
npm install

# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:manageConnections

# Test locally with emulator
npm run serve

# View function logs
npm run logs
```

### Firebase Deployment
```bash
# Deploy hosting only
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy
```

## Architecture Overview

### Database Structure (Flat Collections)

The database uses **flat root-level collections** (not nested under tenants):

- `users/{userId}` - User profiles and metadata
- `connections/{connectionId}` - User connections (peer relationships)
- `opportunities/{opportunityId}` - Job/internship opportunities
- `reports/{reportId}` - User reports for moderation
- `invitation_batches/{batchId}` - Invitation tracking
- `mail/{emailId}` - Email queue for Firebase Auto Send + MailGun

### User Types

Four user types exist in the system:
- **High Schooler** - Students currently in high school
- **College Student** - University/college students (formerly "Alumni")
- **Professional** - Working professionals with experience
- **Staff** - School staff or administrators

**Important**: "Alumni" was renamed to "College Student" during community migration.

### Connection System

Connections are **bidirectional** with two states:
- `pending` - Connection request sent, awaiting approval
- `approved` - Connection accepted by both parties

Each connection creates **two documents** with reciprocal roles:
- One with `role: 'initiator'` (user who sent request)
- One with `role: 'target'` (user who received request)

**Removed Features** (from school version):
- Parent verification system for high schoolers
- `pending_parental_approval` and `parent_approved` states
- User type-based connection restrictions
- School-based tenant isolation

### Stream Chat Integration

Stream Chat provides real-time messaging between approved connections:
- Initialized in `GlobalAuthWrapper.jsx` via `useStreamConnection` hook
- Users connect to Stream after Firebase authentication
- Chat client passed via React Router `Outlet` context
- Only approved connections can message each other

### Firebase Cloud Functions

Active callable functions:

| Function | Purpose |
|----------|---------|
| `manageConnections` | CRUD operations for user connections |
| `createStreamToken` | Generate JWT tokens for Stream Chat |
| `sendEmailNotifications` | Send email notifications via MailGun |
| `sendInviteEmail` | Send invitation emails to new users |
| `sendReport` | Handle user reports and moderation |
| `getEmail` | Retrieve user email addresses |
| `generateUnsubscribeLink` | Create email unsubscribe links |
| `processUnsubscribe` | Handle unsubscribe requests |
| `deleteAuthUsers` | Delete Firebase Auth users |

**Commented Out** (removed in community migration):
- `createSchoolClaim` - Custom claims for school assignment
- `generateVerificationLink` - Parent email verification
- `verifyParentToken` - Parent verification token validation
- `sendGraduationEmails` - Graduation email campaigns
- `migrateAlumniToTenants` - Tenant migration utilities

## Key Files and Services

### Core Context Providers

**`src/contexts/GlobalAuthWrapper.jsx`**
- Top-level authentication wrapper for protected routes
- Initializes Stream Chat connection
- Manages connection modals and notifications
- Listens to user document changes in Firestore
- **No longer uses custom claims or schoolId**

**`src/contexts/ConnectionContext.jsx`**
- Provides connection state (pending, approved, incomingRequests)
- Exposes `refetchConnections()` for updating connection data
- **Removed parent approval states**

**`src/contexts/auth/AuthContext.jsx`**
- Firebase authentication state management
- Provides `currentUser`, `loading`, and auth methods

### Service Layer

**`src/services/connectionService.jsx`**
- All connection operations via `manageConnections` callable function
- Functions: `checkConnection`, `createConnection`, `removeConnection`, `getConnectionsByStatus`
- **All functions no longer require `schoolId` parameter**

**`src/services/onboardingServices.jsx`**
- Save user data during onboarding for all four user types
- Functions: `saveHighSchooler`, `saveCollegeStudent`, `saveProfessional`, `saveStaff`
- **Removed parent verification fields**
- **Writes directly to `users/{userId}` (not tenant-nested)**

**`src/services/opportunityServices.jsx`**
- CRUD operations for opportunities
- **Writes to flat `opportunities` collection**

**`src/services/filteringServices.jsx`**
- Query and filter users/opportunities with pagination
- **Uses flat collections, no `schoolId` parameter**

**`src/services/userProfileServices.jsx`**
- User profile utilities and formatting
- Contains `getBasicUserDescription()` for displaying user info

### Firebase Configuration

**`src/firebase/firebaseConfig.jsx`**
- Firebase app initialization with environment variables
- Exports `db` (Firestore), `auth`, `storage`

**`src/firebase/auth.jsx`**
- Authentication helper functions
- Email/password and Google OAuth support

### Stream Chat

**`src/Streamchat/chatFunctions/setUpUser.js`**
- `useStreamConnection` hook for initializing Stream Chat
- Connects user to Stream with custom token from Cloud Function

**`src/Streamchat/streamChatConfig.jsx`**
- Main chat interface component
- Custom Stream UI with channel lists and messaging

## Common Development Patterns

### Reading User Data
```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// ALWAYS use flat collection path
const userRef = doc(db, 'users', userId);
const userDoc = await getDoc(userRef);
const userData = userDoc.data();
```

### Creating Connections
```javascript
import { createConnection } from '../services/connectionService';

// No schoolId needed
await createConnection(targetUserId, 'pending');
```

### Querying Collections
```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Use flat collection paths
const q = query(
  collection(db, 'users'),
  where('userType', '==', 'High Schooler')
);
const snapshot = await getDocs(q);
```

### Using Stream Chat Context
```javascript
import { useOutletContext } from 'react-router-dom';

function MyComponent() {
  const { chatClient, isConnected } = useOutletContext();

  // chatClient is available after GlobalAuthWrapper initialization
  if (isConnected) {
    // Use Stream Chat API
  }
}
```

## Environment Variables

Required in `.env`:
```
VITE_API_KEY=            # Firebase API Key
VITE_AUTH_DOMAIN=        # Firebase Auth Domain
VITE_PROJECT_ID=         # Firebase Project ID
VITE_STORAGE_BUCKET=     # Firebase Storage Bucket
VITE_MESSAGING_SENDER_ID=# Firebase Messaging Sender ID
VITE_APP_ID=             # Firebase App ID
VITE_STREAM_API_KEY=     # Stream Chat API Key
VITE_ALGOLIA_APP_ID=     # Algolia Search App ID
VITE_ALGOLIA_SEARCH_KEY= # Algolia Search API Key
```

## Migration Context

This codebase contains extensive "COMMUNITY VERSION" comments marking changes from the school-based architecture:

### What Changed
- **Database**: Multi-tenant (`tenants/{schoolId}/users`) → Flat (`users/{userId}`)
- **Connections**: 4 states → 2 states (removed parent approval)
- **Authentication**: Custom claims → Standard Firebase Auth
- **User Types**: "Alumni" → "College Student"
- **Access**: School-isolated → Community-wide

### What to Avoid
- Never add `schoolId` to user data or queries
- Don't implement parent verification workflows
- Don't use nested tenant collections
- Don't add connection restrictions based on user type
- Don't reference custom claims in authentication

## Testing

### Running Tests
Currently no automated test suite. Manual testing recommended for:
- User onboarding flow for all four user types
- Connection creation and approval
- Stream Chat initialization
- Opportunity creation and filtering

### Common Test Scenarios
1. **New user signup** → Onboarding → Profile completion
2. **Send connection request** → Target approves → Chat becomes available
3. **Create opportunity** → Appears in filtered results
4. **Edit profile** → Changes save to Firestore → Stream Chat profile updates

## Firestore Security Rules

Rules enforce:
- Authenticated users can read all profiles (community-wide)
- Users can only modify their own profile
- Connection participants can read/modify their connections
- Opportunity creators can edit their own opportunities

**No longer enforced**:
- School-based tenant isolation
- Custom claims validation
- Parent verification states

## Common Gotchas

1. **Connection Documents Are Dual**: Every connection creates two documents with reciprocal roles. Always query both directions.

2. **User ID Fields**: User documents may have `userId` or `id` fields. Always check both:
   ```javascript
   const userId = user.userId || user.id;
   ```

3. **Stream Chat Timing**: Don't access `chatClient` before `isConnected` is true. It's provided via `Outlet` context only in protected routes.

4. **localStorage Usage**: Connection states are cached in localStorage for performance. Clear on logout or data changes.

5. **College Student vs Alumni**: Frontend may still reference "Alumni" in old code. Prefer "College Student" in new code.

6. **Email System**: All emails use Firebase Auto Send + MailGun. Never use Gmail OAuth2 (legacy system).

## File Organization

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── firebase/           # Firebase configuration
├── pages/              # Route-level page components
│   ├── Authentication/ # Login, Signup
│   ├── Onboarding/     # User type selection and onboarding forms
│   ├── Homepage/       # Main dashboard
│   ├── Network/        # User directory and connections
│   ├── Organizationspage/ # Opportunities listing
│   └── Settings/       # User settings
├── services/           # Business logic and Firebase operations
├── Streamchat/         # Stream Chat integration
├── typesense/          # Typesense search client (alternative to Algolia)
├── utils/              # Utility functions and templates
├── App.jsx             # Root app component
└── main.jsx            # React Router setup and app entry

functions/
├── callableFunctions/  # Firebase callable functions
├── config/             # Function configuration
└── index.js            # Function exports
```

## Additional Documentation

- `MIGRATION_TO_COMMUNITY_VERSION.md` - Complete migration documentation
- `EMAIL_MIGRATION_SUMMARY.md` - Email system migration details
- `GRADUATION_EMAIL_IMPLEMENTATION.md` - Graduation email workflow (deprecated)

## For Playwright: I'm now successfully logged into the Launchpad app. Here's what was accomplished:

  Test Account Created:

  - Email: test.playwright.user@example.com
  - Password: TestPass123!
  - Name: Alex Martinez
  - User Type: College Student
  - College: The University of Texas at Austin
  - High School: Bellaire High School (graduated 2022)
  - Field of Study: Computer Science
  - Skill: Python Programming