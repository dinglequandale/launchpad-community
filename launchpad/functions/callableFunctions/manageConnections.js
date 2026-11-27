const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { requireAuth, enforceRateLimit, toHttpsError } = require('../utils/security');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Connections are a single document per pair:
//   { initiateUserId, targetUserId, status: 'pending' | 'approved', createdAt, updatedAt? }
// Only this function (Admin SDK) writes them; Firestore rules deny client writes.
const VALID_STATUSES = new Set(['pending', 'approved']);

function assertUserId(value, name) {
    if (typeof value !== 'string' || value.length === 0 || value.length > 128 || value.includes('/')) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid ${name}`);
    }
}

exports.manageConnections = functions.https.onCall(async (data, context) => {
    const currentUserId = requireAuth(context, 'Only authenticated users can manage connections.');
    const { action, targetUserId, status, connectionId } = data || {};

    if (!action) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameter: action');
    }

    try {
        switch (action) {
            case 'check':
                assertUserId(targetUserId, 'targetUserId');
                return await checkConnection(currentUserId, targetUserId);

            case 'create':
                assertUserId(targetUserId, 'targetUserId');
                // SECURITY: callers could previously create a connection that was
                // already 'approved', skipping the target's consent entirely.
                if (status !== undefined && status !== 'pending') {
                    throw new functions.https.HttpsError('invalid-argument', "New connections must have status 'pending'.");
                }
                return await createConnection(currentUserId, targetUserId);

            case 'remove':
                assertUserId(targetUserId, 'targetUserId');
                return await removeConnection(currentUserId, targetUserId);

            case 'getByStatus':
                if (!VALID_STATUSES.has(status)) {
                    throw new functions.https.HttpsError('invalid-argument', 'Invalid status');
                }
                return await getConnectionsByStatus(currentUserId, status);

            case 'getAll':
                return await getAllConnections(currentUserId);

            case 'updateStatus':
                assertUserId(connectionId, 'connectionId');
                if (status !== 'approved') {
                    throw new functions.https.HttpsError('invalid-argument', "Only 'approved' is a valid status update. Use 'remove' to decline.");
                }
                return await approveConnection(currentUserId, connectionId);

            default:
                throw new functions.https.HttpsError('invalid-argument', 'Invalid action. Must be: check, create, remove, getByStatus, getAll, or updateStatus');
        }
    } catch (error) {
        throw toHttpsError(error, 'Error managing connections');
    }
});

async function findConnectionDocs(userA, userB) {
    const connectionsRef = db.collection('connections');
    const [s1, s2] = await Promise.all([
        connectionsRef.where('initiateUserId', '==', userA).where('targetUserId', '==', userB).get(),
        connectionsRef.where('initiateUserId', '==', userB).where('targetUserId', '==', userA).get(),
    ]);
    return [...s1.docs, ...s2.docs];
}

async function checkConnection(currentUserId, targetUserId) {
    const docs = await findConnectionDocs(currentUserId, targetUserId);
    const doc = docs[0];
    return {
        isConnected: Boolean(doc),
        connectionData: doc ? { id: doc.id, ...doc.data() } : null,
    };
}

async function createConnection(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
        throw new functions.https.HttpsError('invalid-argument', 'You cannot connect with yourself.');
    }

    const targetSnap = await db.collection('users').doc(targetUserId).get();
    if (!targetSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'That user does not exist.');
    }

    // Each request emails the target, so cap how fast one account can send them.
    await enforceRateLimit(`connectionRequest:${currentUserId}`, { limit: 50, windowSeconds: 24 * 60 * 60 });

    const existing = await checkConnection(currentUserId, targetUserId);
    if (existing.isConnected) {
        return {
            success: false,
            message: 'Connection already exists',
            isConnected: true,
            connectionData: existing.connectionData,
        };
    }

    const connectionRef = db.collection('connections').doc();
    await connectionRef.set({
        initiateUserId: currentUserId,
        targetUserId,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
    });

    return {
        success: true,
        message: 'Connection created successfully',
        isConnected: true,
        connectionId: connectionRef.id,
    };
}

async function removeConnection(currentUserId, targetUserId) {
    const docs = await findConnectionDocs(currentUserId, targetUserId);
    // Delete every matching doc (older data may contain duplicates).
    await Promise.all(docs.map((d) => d.ref.delete()));
    return {
        success: true,
        message: 'Connection removed successfully',
        isConnected: false,
    };
}

async function queryForUser(currentUserId, extraFilter) {
    const connectionsRef = db.collection('connections');
    let initiatorQuery = connectionsRef.where('initiateUserId', '==', currentUserId);
    let targetQuery = connectionsRef.where('targetUserId', '==', currentUserId);
    if (extraFilter) {
        initiatorQuery = initiatorQuery.where('status', '==', extraFilter);
        targetQuery = targetQuery.where('status', '==', extraFilter);
    }
    const [initiatorSnapshot, targetSnapshot] = await Promise.all([initiatorQuery.get(), targetQuery.get()]);
    const connections = [
        ...initiatorSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), role: 'initiator' })),
        ...targetSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), role: 'target' })),
    ];
    return { success: true, connections, count: connections.length };
}

function getConnectionsByStatus(currentUserId, status) {
    return queryForUser(currentUserId, status);
}

function getAllConnections(currentUserId) {
    return queryForUser(currentUserId, null);
}

/**
 * SECURITY: previously any signed-in user could set ANY connection document to
 * ANY status just by knowing its id. Now only the target of a pending request
 * can approve it.
 */
async function approveConnection(currentUserId, connectionId) {
    const connectionRef = db.collection('connections').doc(connectionId);

    await db.runTransaction(async (tx) => {
        const snap = await tx.get(connectionRef);
        if (!snap.exists) {
            throw new functions.https.HttpsError('not-found', 'Connection not found');
        }
        const connection = snap.data();
        if (connection.targetUserId !== currentUserId) {
            throw new functions.https.HttpsError('permission-denied', 'Only the recipient can approve this request.');
        }
        if (connection.status !== 'pending') {
            throw new functions.https.HttpsError('failed-precondition', 'This request is no longer pending.');
        }
        tx.update(connectionRef, {
            status: 'approved',
            updatedAt: FieldValue.serverTimestamp(),
        });
    });

    return {
        success: true,
        message: 'Connection status updated successfully',
        connectionId,
        newStatus: 'approved',
    };
}
