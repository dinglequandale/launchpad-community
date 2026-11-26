const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { escapeHtml, requireAdmin, toHttpsError } = require('../utils/security');
const { isUnsubscribed } = require('../utils/unsubscribe');

// Email templates are defined inline to avoid import issues
const rawGraduationEmailTemplate = (userName, schoolName, migrationLink) => {
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

const rawMigrationReminderEmailTemplate = (userName, schoolName, migrationLink) => {
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


// User-controlled values (names, school names) must be escaped before going into HTML.
const graduationEmailTemplate = (userName, schoolName, migrationLink) =>
    rawGraduationEmailTemplate(escapeHtml(userName), escapeHtml(schoolName), escapeHtml(migrationLink));
const migrationReminderEmailTemplate = (userName, schoolName, migrationLink) =>
    rawMigrationReminderEmailTemplate(escapeHtml(userName), escapeHtml(schoolName), escapeHtml(migrationLink));

const SITE_URL = 'https://launchpadhouston.com';
const FROM_ADDRESS = 'Launchpad Networks <no-reply@launchpadhouston.com>';
const GRADUATION_MONTH = 5; // May
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const MIGRATION_PATHS = {
    hs_to_college: 'migrate-to-alumni',
    college_to_professional: 'migrate-to-professional',
};

function migrationLinkFor(transitionType, token, userId) {
    const path = MIGRATION_PATHS[transitionType] || MIGRATION_PATHS.hs_to_college;
    return `${SITE_URL}/${path}?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;
}

/**
 * Core graduation-email job, shared by the admin callable and the scheduled run.
 * Idempotent per user per year: a user who already has a graduation token for the
 * current year is skipped, so re-running the job never double-emails anyone.
 */
async function runGraduationEmails({ testMode = false } = {}) {
    const db = admin.firestore();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (!testMode && currentMonth !== GRADUATION_MONTH) {
        return {
            success: false,
            message: `Graduation emails are only sent in May. Current month: ${currentMonth}`,
            recipientsCount: 0,
        };
    }

    const usersRef = db.collection('users');
    const [hsSnapshot, collegeSnapshot] = await Promise.all([
        usersRef.where('userType', '==', 'High Schooler').where('graduationYear', '==', currentYear.toString()).get(),
        usersRef.where('userType', '==', 'College Student').where('collegeGraduationYear', '==', currentYear.toString()).get(),
    ]);

    const recipients = [];
    hsSnapshot.forEach((doc) => {
        const u = doc.data();
        if (u.email) {
            recipients.push({
                userId: doc.id,
                email: u.email,
                userName: u.userName,
                schoolName: u.schoolAttending,
                transitionType: 'hs_to_college',
            });
        }
    });
    collegeSnapshot.forEach((doc) => {
        const u = doc.data();
        if (u.email) {
            recipients.push({
                userId: doc.id,
                email: u.email,
                userName: u.userName,
                schoolName: u.collegeAttending || u.schoolAttending,
                transitionType: 'college_to_professional',
            });
        }
    });

    let sent = 0;
    for (const recipient of recipients) {
        if (await isUnsubscribed(recipient.email, 'graduation')) continue;

        const existing = await db.collection('migration_tokens')
            .where('userId', '==', recipient.userId)
            .where('emailType', '==', 'graduation')
            .where('year', '==', currentYear)
            .limit(1)
            .get();
        if (!existing.empty) continue;

        const tokenRef = db.collection('migration_tokens').doc();
        await tokenRef.set({
            userId: recipient.userId,
            email: recipient.email,
            userName: recipient.userName || null,
            schoolName: recipient.schoolName || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + TOKEN_TTL_MS),
            used: false,
            emailType: 'graduation',
            transitionType: recipient.transitionType,
            year: currentYear,
        });

        await db.collection('mail').add({
            to: recipient.email,
            message: {
                subject: '🎓 Congratulations on Your Graduation! - Update Your Launchpad Profile',
                html: graduationEmailTemplate(
                    recipient.userName || 'Graduate',
                    recipient.schoolName || 'your school',
                    migrationLinkFor(recipient.transitionType, tokenRef.id, recipient.userId),
                ),
            },
            from: FROM_ADDRESS,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            provider: 'mailgun',
            emailType: 'graduation',
            userId: recipient.userId,
            migrationToken: tokenRef.id,
            transitionType: recipient.transitionType,
        });
        sent++;
    }

    const breakdown = {
        hsToCollege: recipients.filter((r) => r.transitionType === 'hs_to_college').length,
        collegeToProfessional: recipients.filter((r) => r.transitionType === 'college_to_professional').length,
    };

    await db.collection('email_batches').add({
        type: 'graduation_emails',
        year: currentYear,
        eligibleCount: recipients.length,
        recipientsCount: sent,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        testMode,
        breakdown,
    });

    return {
        success: true,
        message: `Graduation emails queued for ${sent} recipients (${recipients.length} eligible)`,
        recipientsCount: sent,
        breakdown,
    };
}

// Admin-only. (Previously ANY signed-in user could trigger a mass email, and
// `testMode: true` bypassed the May-only guard.)
exports.sendGraduationEmails = functions.https.onCall(async (data, context) => {
    await requireAdmin(context);
    try {
        return await runGraduationEmails({ testMode: Boolean(data && data.testMode) });
    } catch (error) {
        throw toHttpsError(error, 'Error sending graduation emails');
    }
});

// Runs at 9 AM Central on May 15th. (The old schedule ran on June 1st -- outside the
// May-only window, so it never sent anything -- and iterated a `tenants` collection
// that no longer exists in the community version.)
exports.scheduledGraduationEmails = functions.pubsub.schedule('0 9 15 5 *')
    .timeZone('America/Chicago')
    .onRun(async () => {
        const result = await runGraduationEmails();
        console.log('Scheduled graduation emails completed:', result);
        return null;
    });

// Admin-only reminder for graduates who have not completed their migration.
exports.sendMigrationReminders = functions.https.onCall(async (data, context) => {
    await requireAdmin(context);
    const daysAfterGraduation = Number((data && data.daysAfterGraduation) || 7);

    try {
        const db = admin.firestore();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAfterGraduation);

        const snapshot = await db.collection('migration_tokens')
            .where('used', '==', false)
            .where('emailType', '==', 'graduation')
            .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(cutoffDate))
            .get();

        let sent = 0;
        for (const doc of snapshot.docs) {
            const tokenData = doc.data();
            const expiresAt = tokenData.expiresAt && typeof tokenData.expiresAt.toDate === 'function'
                ? tokenData.expiresAt.toDate()
                : new Date(tokenData.expiresAt);
            if (!(expiresAt > new Date()) || tokenData.reminderSentAt) continue;
            if (await isUnsubscribed(tokenData.email, 'migration_reminder')) continue;

            await db.collection('mail').add({
                to: tokenData.email,
                message: {
                    subject: "⏰ Complete Your Launchpad Profile Update - Don't Miss Out!",
                    html: migrationReminderEmailTemplate(
                        tokenData.userName || 'Graduate',
                        tokenData.schoolName || 'your school',
                        migrationLinkFor(tokenData.transitionType, doc.id, tokenData.userId),
                    ),
                },
                from: FROM_ADDRESS,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'pending',
                provider: 'mailgun',
                emailType: 'migration_reminder',
                userId: tokenData.userId,
                migrationToken: doc.id,
            });
            await doc.ref.update({ reminderSentAt: admin.firestore.FieldValue.serverTimestamp() });
            sent++;
        }

        return {
            success: true,
            message: `Migration reminder emails queued for ${sent} recipients`,
            recipientsCount: sent,
        };
    } catch (error) {
        throw toHttpsError(error, 'Error sending migration reminders');
    }
});

exports.runGraduationEmails = runGraduationEmails;
