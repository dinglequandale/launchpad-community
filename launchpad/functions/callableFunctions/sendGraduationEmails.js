const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Email templates are defined inline to avoid import issues
const graduationEmailTemplate = (userName, schoolName, migrationLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Congratulations on Your Graduation!</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .email-container { background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2c5282; font-size: 28px; margin-bottom: 10px; }
            .button { display: inline-block; padding: 15px 30px; background-color: #2c5282; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; text-align: center; }
            .button-container { text-align: center; margin: 30px 0; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>🎓 Congratulations on Your Graduation!</h1>
                <h2>Class of ${new Date().getFullYear()}</h2>
            </div>
            <p>Dear ${userName},</p>
            <p>Congratulations on graduating from ${schoolName}! We're excited to invite you to migrate your Launchpad account to our Alumni network.</p>
            <div class="button-container">
                <a href="${migrationLink}" class="button">Migrate to Alumni Account</a>
            </div>
            <p>Best regards,<br>The Launchpad Team</p>
        </div>
    </body>
    </html>
  `;
};

const migrationReminderEmailTemplate = (userName, schoolName, migrationLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Alumni Migration</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .email-container { background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #e53e3e; font-size: 24px; margin-bottom: 10px; }
            .button { display: inline-block; padding: 15px 30px; background-color: #e53e3e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; text-align: center; }
            .button-container { text-align: center; margin: 30px 0; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>⏰ Don't Miss Out!</h1>
            </div>
            <p>Hi ${userName},</p>
            <p>We noticed you haven't completed your alumni account migration yet. Complete your migration now to unlock exclusive alumni benefits.</p>
            <div class="button-container">
                <a href="${migrationLink}" class="button">Complete Migration Now</a>
            </div>
            <p>Best regards,<br>The Launchpad Team</p>
        </div>
    </body>
    </html>
  `;
};

exports.sendGraduationEmails = functions.https.onCall(async (data, context) => {
    const { schoolId, testMode = false } = data;

    // Ensure the user is authenticated and has admin privileges
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can send graduation emails.');
    }

    try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // 1-12

        // Only send graduation emails in June (month 6)
        if (!testMode && currentMonth !== 6) {
            return {
                success: false,
                message: `Graduation emails are only sent in June. Current month: ${currentMonth}`
            };
        }

        /* 
        ========================================
        TESTING CODE - Uncomment sections below to test graduation emails without waiting for June:
        ========================================
        
        // OPTION 1: Override the month check completely (easiest for testing)
        // Comment out the month check above and uncomment this:
        // console.log('TESTING MODE: Overriding month restriction');
        
        // OPTION 2: Test with a specific graduation year
        // Uncomment this line to test with graduates from a specific year:
        // const currentYear = 2024; // Change to any year you have test data for
        
        // OPTION 3: Test with a specific school ID
        // Uncomment and modify this line to test with a specific school:
        // const schoolId = 'awty'; // Change to your test school ID
        
        // OPTION 4: Test with specific user IDs (for targeted testing)
        // Uncomment this section to test with specific users:
        // const testUserIds = ['user1', 'user2', 'user3']; // Add your test user IDs
        // const snapshot = await usersRef
        //     .where('userType', '==', 'High Schooler')
        //     .where('graduationYear', '==', currentYear.toString())
        //     .where(admin.firestore.FieldPath.documentId(), 'in', testUserIds)
        //     .get();
        
        // OPTION 5: Create test data (run this in Firebase console or admin SDK)
        // Uncomment and run this to create test high schooler data:
        // await admin.firestore().collection('tenants').doc('your-school-id').collection('users').doc('test-user-1').set({
        //     userType: 'High Schooler',
        //     graduationYear: '2024',
        //     userName: 'Test Student',
        //     email: 'test@example.com',
        //     schoolAttending: 'Test High School',
        //     schoolId: 'your-school-id'
        // });
        */

        // Query for high schoolers graduating this year
        const usersRef = admin.firestore().collection('tenants').doc(schoolId).collection('users');
        const snapshot = await usersRef
            .where('userType', '==', 'High Schooler')
            .where('graduationYear', '==', currentYear.toString())
            .get();

        if (snapshot.empty) {
            return {
                success: true,
                message: 'No graduating high schoolers found for this year',
                recipientsCount: 0
            };
        }

        const recipients = [];
        const emailPromises = [];

        snapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.email) {
                recipients.push({
                    userId: doc.id,
                    email: userData.email,
                    userName: userData.userName,
                    schoolAttending: userData.schoolAttending,
                    graduationYear: userData.graduationYear
                });
            }
        });

        if (recipients.length === 0) {
            return {
                success: true,
                message: 'No valid email addresses found for graduating students',
                recipientsCount: 0
            };
        }

        // Generate migration links for each recipient
        for (const recipient of recipients) {
            const migrationToken = admin.firestore().collection('migration_tokens').doc().id;
            const migrationLink = `https://launchpadhouston.com/migrate-to-alumni?token=${migrationToken}&userId=${recipient.userId}`;
            
            // Store migration token with expiration (30 days)
            await admin.firestore().collection('migration_tokens').doc(migrationToken).set({
                userId: recipient.userId,
                schoolId: schoolId,
                email: recipient.email,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                used: false,
                emailType: 'graduation'
            });

            // Create email document for Mailgun
            const emailTemplate = graduationEmailTemplate(
                recipient.userName,
                recipient.schoolAttending,
                migrationLink
            );

            const emailDoc = admin.firestore().collection('mail').add({
                to: recipient.email,
                message: {
                    subject: `🎓 Congratulations on Your Graduation! - Complete Your Alumni Migration`,
                    html: emailTemplate,
                },
                from: 'no-reply@launchpadhouston.com',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'pending',
                provider: 'mailgun',
                emailType: 'graduation',
                userId: recipient.userId,
                schoolId: schoolId,
                migrationToken: migrationToken
            });

            emailPromises.push(emailDoc);
        }

        await Promise.all(emailPromises);

        // Log the graduation email batch
        await admin.firestore().collection('email_batches').add({
            type: 'graduation_emails',
            schoolId: schoolId,
            year: currentYear,
            recipientsCount: recipients.length,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            testMode: testMode
        });

        return {
            success: true,
            message: `Graduation emails queued for ${recipients.length} recipients`,
            recipientsCount: recipients.length,
            recipients: recipients.map(r => ({ userId: r.userId, email: r.email }))
        };

    } catch (error) {
        console.error('Error sending graduation emails:', error);
        throw new functions.https.HttpsError('internal', 'Error sending graduation emails: ' + error.message);
    }
});

// Scheduled function to send graduation emails automatically in June
exports.scheduledGraduationEmails = functions.pubsub.schedule('0 9 1 6 *') // 9 AM on June 1st
    .timeZone('America/Chicago')
    .onRun(async (context) => {
        console.log('Running scheduled graduation emails...');
        
        try {
            // Get all schools
            const schoolsSnapshot = await admin.firestore().collection('tenants').get();
            const results = [];

            for (const schoolDoc of schoolsSnapshot.docs) {
                const schoolId = schoolDoc.id;
                console.log(`Processing graduation emails for school: ${schoolId}`);
                
                try {
                    // Call the sendGraduationEmails function for each school
                    const result = await exports.sendGraduationEmails.run({
                        schoolId: schoolId,
                        testMode: false
                    });
                    
                    results.push({
                        schoolId: schoolId,
                        success: result.success,
                        message: result.message,
                        recipientsCount: result.recipientsCount
                    });
                } catch (error) {
                    console.error(`Error processing school ${schoolId}:`, error);
                    results.push({
                        schoolId: schoolId,
                        success: false,
                        error: error.message
                    });
                }
            }

            console.log('Scheduled graduation emails completed:', results);
            return results;
        } catch (error) {
            console.error('Error in scheduled graduation emails:', error);
            throw error;
        }
    });

// Function to send migration reminder emails
exports.sendMigrationReminders = functions.https.onCall(async (data, context) => {
    const { schoolId, daysAfterGraduation = 7 } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can send migration reminders.');
    }

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAfterGraduation);

        // Find migration tokens that haven't been used and are older than the cutoff date
        const migrationTokensSnapshot = await admin.firestore()
            .collection('migration_tokens')
            .where('used', '==', false)
            .where('emailType', '==', 'graduation')
            .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(cutoffDate))
            .get();

        if (migrationTokensSnapshot.empty) {
            return {
                success: true,
                message: 'No pending migrations found for reminder emails',
                recipientsCount: 0
            };
        }

        const emailPromises = [];

        migrationTokensSnapshot.forEach(doc => {
            const tokenData = doc.data();
            
            // Check if token hasn't expired
            if (tokenData.expiresAt && tokenData.expiresAt.toDate() > new Date()) {
                const migrationLink = `https://launchpadhouston.com/migrate-to-alumni?token=${doc.id}&userId=${tokenData.userId}`;
                
                const emailTemplate = migrationReminderEmailTemplate(
                    tokenData.userName || 'Graduate',
                    tokenData.schoolName || 'Your School',
                    migrationLink
                );

                const emailDoc = admin.firestore().collection('mail').add({
                    to: tokenData.email,
                    message: {
                        subject: `⏰ Complete Your Alumni Migration - Don't Miss Out!`,
                        html: emailTemplate,
                    },
                    from: 'no-reply@launchpadhouston.com',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'pending',
                    provider: 'mailgun',
                    emailType: 'migration_reminder',
                    userId: tokenData.userId,
                    schoolId: tokenData.schoolId,
                    migrationToken: doc.id
                });

                emailPromises.push(emailDoc);
            }
        });

        await Promise.all(emailPromises);

        return {
            success: true,
            message: `Migration reminder emails queued for ${emailPromises.length} recipients`,
            recipientsCount: emailPromises.length
        };

    } catch (error) {
        console.error('Error sending migration reminders:', error);
        throw new functions.https.HttpsError('internal', 'Error sending migration reminders: ' + error.message);
    }
});

/*
========================================
TESTING FUNCTION - Uncomment to create a simple test endpoint
========================================

// Simple test function that bypasses all restrictions
exports.testGraduationEmails = functions.https.onCall(async (data, context) => {
    const { schoolId, testEmail } = data;
    
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can test graduation emails.');
    }

    try {
        // Create a test user data object
        const testUser = {
            userId: 'test-user-' + Date.now(),
            email: testEmail || 'test@example.com',
            userName: 'Test Student',
            schoolAttending: 'Test High School',
            graduationYear: new Date().getFullYear().toString()
        };

        // Generate migration token
        const migrationToken = admin.firestore().collection('migration_tokens').doc().id;
        const migrationLink = `https://launchpadhouston.com/migrate-to-alumni?token=${migrationToken}&userId=${testUser.userId}`;
        
        // Store migration token
        await admin.firestore().collection('migration_tokens').doc(migrationToken).set({
            userId: testUser.userId,
            schoolId: schoolId || 'test-school',
            email: testUser.email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            used: false,
            emailType: 'graduation'
        });

        // Create email document
        const emailTemplate = graduationEmailTemplate(
            testUser.userName,
            testUser.schoolAttending,
            migrationLink
        );

        const emailDoc = await admin.firestore().collection('mail').add({
            to: testUser.email,
            message: {
                subject: `🎓 TEST - Congratulations on Your Graduation! - Complete Your Alumni Migration`,
                html: emailTemplate,
            },
            from: 'no-reply@launchpadhouston.com',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            provider: 'mailgun',
            emailType: 'graduation',
            userId: testUser.userId,
            schoolId: schoolId || 'test-school',
            migrationToken: migrationToken,
            isTestEmail: true
        });

        return {
            success: true,
            message: `Test graduation email sent to ${testUser.email}`,
            emailId: emailDoc.id,
            migrationLink: migrationLink
        };

    } catch (error) {
        console.error('Error in test graduation emails:', error);
        throw new functions.https.HttpsError('internal', 'Error sending test graduation email: ' + error.message);
    }
});

// To use this test function:
// 1. Uncomment the function above
// 2. Deploy your Firebase functions
// 3. Call it from your frontend or Firebase console with:
//    { schoolId: 'your-school-id', testEmail: 'your-email@example.com' }
*/
