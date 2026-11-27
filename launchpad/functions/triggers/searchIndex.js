const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const {
    buildSearchTokens,
    sameTokens,
    USER_SEARCH_FIELDS,
    OPPORTUNITY_SEARCH_FIELDS,
} = require('../utils/searchTokens');

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Keep `searchTokens` in sync with the document's searchable fields. The write
 * below re-triggers this function once; it then sees identical tokens and stops.
 * Because tokens are recomputed on every write, a client that tampers with its
 * own tokens is corrected immediately.
 */
function indexer(fields) {
    return async (change) => {
        if (!change.after.exists) return null;
        const data = change.after.data();
        const tokens = buildSearchTokens(data, fields);
        if (sameTokens(tokens, data.searchTokens)) return null;
        await change.after.ref.update({ searchTokens: tokens });
        return null;
    };
}

exports.indexUserForSearch = functions.firestore
    .document('users/{userId}')
    .onWrite(indexer(USER_SEARCH_FIELDS));

exports.indexOpportunityForSearch = functions.firestore
    .document('opportunities/{opportunityId}')
    .onWrite(indexer(OPPORTUNITY_SEARCH_FIELDS));

exports.indexSocietyOpportunityForSearch = functions.firestore
    .document('societies/{societyId}/opportunities/{opportunityId}')
    .onWrite(indexer(OPPORTUNITY_SEARCH_FIELDS));

async function rebuild(querySnapshotPromise, fields) {
    const snapshot = await querySnapshotPromise;
    const writer = admin.firestore().bulkWriter();
    let updated = 0;
    snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const tokens = buildSearchTokens(data, fields);
        if (!sameTokens(tokens, data.searchTokens)) {
            writer.update(doc.ref, { searchTokens: tokens });
            updated++;
        }
    });
    await writer.close();
    return { scanned: snapshot.size, updated };
}

/**
 * One-off maintenance jobs, started by creating a document in `admin_tasks`
 * from the Firebase console (clients cannot write there):
 *
 *   admin_tasks/<any id>  { type: "rebuildSearchIndex" }
 *
 * The function records its result on the same document.
 */
exports.onAdminTaskCreated = functions
    .runWith({ timeoutSeconds: 540, memory: '1GB' })
    .firestore.document('admin_tasks/{taskId}')
    .onCreate(async (snap) => {
        const task = snap.data() || {};
        if (task.type !== 'rebuildSearchIndex') {
            await snap.ref.update({ status: 'ignored', reason: `Unknown task type: ${task.type}` });
            return null;
        }
        await snap.ref.update({ status: 'running', startedAt: FieldValue.serverTimestamp() });
        try {
            const db = admin.firestore();
            const users = await rebuild(db.collection('users').get(), USER_SEARCH_FIELDS);
            // collectionGroup covers both /opportunities and /societies/*/opportunities.
            const opportunities = await rebuild(db.collectionGroup('opportunities').get(), OPPORTUNITY_SEARCH_FIELDS);
            await snap.ref.update({
                status: 'done',
                finishedAt: FieldValue.serverTimestamp(),
                result: { users, opportunities },
            });
        } catch (error) {
            console.error('rebuildSearchIndex failed:', error);
            await snap.ref.update({ status: 'error', error: String(error.message || error) });
        }
        return null;
    });
