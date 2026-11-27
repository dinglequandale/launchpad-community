const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { StreamChat } = require('stream-chat');
const { requireAuth, toHttpsError } = require('../utils/security');

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Deletes the caller's account and the data that belongs to it.
 *
 * Replaces the old client-side flow, which deleted the Firestore profile first and
 * then called `currentUser.delete()` -- a method that did not exist on the spread
 * user object in AuthContext, so the profile vanished while the Auth account,
 * connections, uploaded files and Stream user all stayed behind.
 */
exports.deleteMyAccount = functions.https.onCall(async (data, context) => {
    const uid = requireAuth(context);
    const db = admin.firestore();

    try {
        const userSnap = await db.collection('users').doc(uid).get();
        const userData = userSnap.exists ? userSnap.data() : {};
        const writer = db.bulkWriter();

        // Connections in either direction.
        const [asInitiator, asTarget] = await Promise.all([
            db.collection('connections').where('initiateUserId', '==', uid).get(),
            db.collection('connections').where('targetUserId', '==', uid).get(),
        ]);
        [...asInitiator.docs, ...asTarget.docs].forEach((d) => writer.delete(d.ref));

        // Opportunities the user created (and their logos below).
        const opportunities = await db.collection('opportunities').where('createdBy', '==', uid).get();
        opportunities.docs.forEach((d) => writer.delete(d.ref));

        // Society profiles and access grants.
        const societies = Array.isArray(userData.societies) ? userData.societies : [];
        for (const societyId of new Set([...societies, 'hsfs'])) {
            writer.delete(db.collection('societies').doc(societyId).collection('users').doc(uid));
            writer.delete(db.collection('societies').doc(societyId).collection('grants').doc(uid));
        }

        writer.delete(db.collection('users').doc(uid));
        await writer.close();

        // Uploaded files (every path variant the frontend has ever used).
        const bucket = admin.storage().bucket();
        const paths = [
            `profile_pictures/pfp_${uid}`,
            `resumes/resume_${uid}.pdf`,
            `resumes/resume_${uid}`,
            `resumes/${uid}`,
            ...opportunities.docs.map((d) => `opportunity-logos/${d.id}`),
        ];
        await Promise.all(paths.map((p) => bucket.file(p).delete({ ignoreNotFound: true }).catch((e) => {
            console.warn(`Could not delete ${p}:`, e.message);
        })));

        // Stream Chat user (best effort; requires STREAM_API_KEY / STREAM_SECRET).
        if (process.env.STREAM_API_KEY && process.env.STREAM_SECRET) {
            try {
                const stream = new StreamChat(process.env.STREAM_API_KEY, process.env.STREAM_SECRET);
                await stream.deleteUser(uid, { mark_messages_deleted: false });
            } catch (e) {
                console.warn('Could not delete Stream user:', e.message);
            }
        }

        // Finally the Auth account itself.
        await admin.auth().deleteUser(uid);

        return { success: true };
    } catch (error) {
        throw toHttpsError(error, 'Could not delete account');
    }
});
