const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const {
    requireAuth,
    isValidEmail,
    sanitizeHeader,
    enforceRateLimit,
    toHttpsError,
} = require('../utils/security');
const { generateUnsubscribeLink, isUnsubscribed } = require('../utils/unsubscribe');

// SECURITY: this function used to be callable WITHOUT authentication and accepted an
// arbitrary sender, recipient list and HTML body -- i.e. an open mail relay on the
// launchpadhouston.com domain. It now:
//   * requires a signed-in user,
//   * always sends from the fixed no-reply address,
//   * only accepts known email types,
//   * caps recipients per call and per user per day,
//   * records the sending uid on every queued mail document.
// The HTML body is still client-supplied (the invitation templates live in the
// frontend); moving those templates server-side is the remaining hardening step.
const FROM_ADDRESS = 'Launchpad Networks <no-reply@launchpadhouston.com>';
const ALLOWED_EMAIL_TYPES = new Set(['invitation', 'parent_invitation', 'migration_success']);
const MAX_RECIPIENTS_PER_CALL = 10;
const MAX_RECIPIENTS_PER_DAY = 25;
const MAX_HTML_BYTES = 100 * 1024;

exports.sendSESEmail = functions.https.onCall(async (data, context) => {
    const uid = requireAuth(context, 'You must be signed in to send email.');
    const { recipient, subject, htmlTemplate, emailType = 'invitation' } = data || {};

    const recipients = Array.isArray(recipient) ? recipient : [recipient];
    if (!subject || !htmlTemplate || recipients.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'recipient, subject and htmlTemplate are required.');
    }
    if (!ALLOWED_EMAIL_TYPES.has(emailType)) {
        throw new functions.https.HttpsError('invalid-argument', `Unsupported emailType: ${emailType}`);
    }
    if (recipients.length > MAX_RECIPIENTS_PER_CALL) {
        throw new functions.https.HttpsError('invalid-argument', `At most ${MAX_RECIPIENTS_PER_CALL} recipients per request.`);
    }
    if (!recipients.every(isValidEmail)) {
        throw new functions.https.HttpsError('invalid-argument', 'One or more recipient addresses are invalid.');
    }
    if (typeof htmlTemplate !== 'string' || Buffer.byteLength(htmlTemplate, 'utf8') > MAX_HTML_BYTES) {
        throw new functions.https.HttpsError('invalid-argument', 'Email body is missing or too large.');
    }

    try {
        await enforceRateLimit(`sesEmail:${uid}`, {
            limit: MAX_RECIPIENTS_PER_DAY,
            windowSeconds: 24 * 60 * 60,
            cost: recipients.length,
        });

        const safeSubject = sanitizeHeader(subject);
        const queued = [];

        for (const rawEmail of recipients) {
            const email = rawEmail.trim().toLowerCase();
            if (await isUnsubscribed(email, emailType)) {
                console.log(`Skipping email to ${email} - unsubscribed from ${emailType}`);
                continue;
            }

            const unsubscribeLink = await generateUnsubscribeLink(email, emailType);
            const html = htmlTemplate.replace(/\$\{unsubscribeLink\}/g, unsubscribeLink);

            const ref = await admin.firestore().collection('mail').add({
                to: email,
                message: { subject: safeSubject, html },
                from: FROM_ADDRESS,
                createdAt: FieldValue.serverTimestamp(),
                status: 'pending',
                provider: 'mailgun',
                unsubscribeLink,
                emailType,
                senderId: uid,
            });
            queued.push(ref.id);
        }

        return {
            success: true,
            message: queued.length ? 'Emails queued for sending successfully' : 'No valid recipients (all unsubscribed)',
            emailIds: queued,
            recipientsCount: queued.length,
        };
    } catch (error) {
        throw toHttpsError(error, 'Error sending email');
    }
});
