# Graduation Email System Implementation

## Overview
This implementation provides a comprehensive system for automatically sending graduation emails to high schoolers around June, encouraging them to migrate their accounts to alumni status. The system includes email templates, migration pages, and admin controls.

## Key Features

### 1. Email Templates (`src/utils/generalEmailTemplates.js`)
- **Graduation Email Template**: Congratulatory email with migration link
- **Migration Reminder Template**: Follow-up email for incomplete migrations
- **Success Email Template**: Confirmation email after successful migration

### 2. Firebase Functions (`functions/callableFunctions/sendGraduationEmails.js`)
- **`sendGraduationEmails`**: Sends graduation emails to all graduating high schoolers
- **`sendMigrationReminders`**: Sends reminder emails to users who haven't migrated
- **`scheduledGraduationEmails`**: Automated function that runs on June 1st at 9 AM CST

### 3. Migration Page (`src/pages/MigrateToAlumni/MigrateToAlumni.jsx`)
- Secure migration page with token validation
- Pre-populated form with existing high schooler data
- Alumni-specific fields (college, skills, networking preferences)
- One-click migration process

### 4. Admin Controls (`src/pages/Settings/sections/GraduationEmailSettings.jsx`)
- Admin interface for managing graduation emails
- Test email functionality
- Migration reminder controls
- Email status monitoring

### 5. Service Layer (`src/services/graduationEmailService.js`)
- Frontend service for calling Firebase functions
- Utility methods for email management
- Error handling and result formatting

## Data Flow

### High Schooler to Alumni Migration Process

1. **Graduation Detection**: System identifies high schoolers with `graduationYear` matching current year
2. **Email Generation**: Personalized graduation emails are created with unique migration tokens
3. **Email Delivery**: Emails are sent via MailGun through Firebase Auto Send extension
4. **Migration Link**: Students click link to access migration page
5. **Account Update**: User data is updated from "High Schooler" to "Alumni" with additional fields
6. **Confirmation**: Success email is sent confirming the migration

### Key Data Fields

#### High Schooler Fields (Preserved)
- `userName`, `userPfpPreview`, `areasOfInterest`
- `linkedinLink`, `email`, `graduationYear`
- `schoolAttending`, `schoolId`, `userId`

#### New Alumni Fields (Added during migration)
- `collegeAttending`: College the alumni is attending
- `userSkills`: Array of skills with categories and descriptions
- `networkingLevel`: Array of mentorship commitment levels
- `migratedAt`: Timestamp of migration
- `migratedFrom`: Source user type

## Email System Integration

### MailGun Integration
- Uses existing `sendSESEmail` Firebase function
- Emails are queued in Firestore `mail` collection
- Firebase Auto Send extension processes the queue
- Includes unsubscribe functionality

### Email Types
- `graduation`: Initial graduation emails
- `migration_reminder`: Follow-up reminders
- `migration_success`: Confirmation emails

## Security Features

### Migration Token System
- Unique tokens generated for each migration link
- 30-day expiration period
- One-time use validation
- User ID verification

### Access Control
- Migration page requires valid token
- Admin functions require authentication
- School ID validation for multi-tenant support

## Scheduling

### Automatic Execution
- **When**: June 1st at 9 AM CST
- **What**: Sends graduation emails to all schools
- **How**: Firebase Cloud Scheduler with Pub/Sub

### Manual Execution
- Admin can send emails anytime via settings page
- Test mode available for development
- Migration reminders can be sent on-demand

## File Structure

```
src/
├── utils/
│   └── generalEmailTemplates.js          # Email templates
├── services/
│   └── graduationEmailService.js         # Frontend service
├── pages/
│   ├── MigrateToAlumni/
│   │   ├── MigrateToAlumni.jsx           # Migration page
│   │   └── MigrateToAlumni.css           # Migration styles
│   └── Settings/sections/
│       ├── GraduationEmailSettings.jsx   # Admin controls
│       └── GraduationEmailSettings.css   # Admin styles
└── main.jsx                              # Route configuration

functions/callableFunctions/
└── sendGraduationEmails.js               # Firebase functions
```

## Usage Instructions

### For Administrators
1. Navigate to Settings → Graduation Emails
2. View current email status and statistics
3. Send graduation emails manually (if needed)
4. Send migration reminders to incomplete users
5. Monitor email delivery and migration rates

### For Graduating Students
1. Receive graduation email in June
2. Click "Migrate to Alumni Account" button
3. Complete alumni-specific information
4. Submit migration form
5. Receive confirmation email

### For Developers
1. Test emails using the test mode
2. Monitor Firebase function logs
3. Check Firestore collections for email status
4. Verify MailGun delivery reports

## Database Collections

### New Collections
- `migration_tokens`: Stores migration tokens and metadata
- `email_batches`: Tracks graduation email campaigns
- `unsubscribe_tokens`: Manages email unsubscribe functionality

### Modified Collections
- `users`: Updated with alumni-specific fields
- `mail`: Extended with graduation email types

## Error Handling

### Frontend
- Token validation and expiration checks
- Network error handling with user feedback
- Form validation for required fields

### Backend
- Authentication and authorization checks
- Email delivery error handling
- Database transaction safety

## Future Enhancements

### Potential Improvements
1. **Analytics Dashboard**: Track email open rates and migration success
2. **A/B Testing**: Test different email templates
3. **Bulk Operations**: Mass migration tools for administrators
4. **Integration**: Connect with school graduation databases
5. **Notifications**: In-app notifications for migration reminders

### Monitoring
- Email delivery success rates
- Migration completion rates
- User engagement metrics
- Error tracking and alerting

## Dependencies

### Frontend
- React Router for navigation
- Firebase SDK for authentication and Firestore
- React Hot Toast for notifications
- React Icons for UI elements

### Backend
- Firebase Functions for serverless execution
- Firebase Admin SDK for database operations
- MailGun for email delivery
- Cloud Scheduler for automated execution

## Configuration

### Environment Variables
- `GMAIL_CLIENT_ID`: For email authentication
- `GMAIL_CLIENT_SECRET`: For email authentication
- `GMAIL_REFRESH_TOKEN`: For email authentication
- `APP_URL`: Base URL for migration links

### Firebase Configuration
- Cloud Functions deployed to production
- Firestore security rules updated
- Cloud Scheduler configured for June 1st execution
- MailGun extension enabled

This implementation provides a complete, production-ready system for managing the high schooler to alumni transition process with automated email notifications and a seamless migration experience.
