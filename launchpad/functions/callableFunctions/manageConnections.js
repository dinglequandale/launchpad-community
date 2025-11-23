const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

exports.manageConnections = functions.https.onCall(async (data, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can manage connections.');
    }

    const { action, targetUserId, status } = data;
    const currentUserId = context.auth.uid;

    // Validate required parameters
    if (!action) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameter: action');
    }

    try {
        switch (action) {
            case 'check':
                if (!targetUserId) {
                    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameter: targetUserId');
                }
                return await checkConnection(currentUserId, targetUserId);

            case 'create':
                if (!targetUserId || !status) {
                    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters for create: targetUserId, status');
                }
                return await createConnection(currentUserId, targetUserId, status);

            case 'remove':
                if (!targetUserId) {
                    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameter: targetUserId');
                }
                return await removeConnection(currentUserId, targetUserId);

            case 'getByStatus':
                if (!status) {
                    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameter: status');
                }
                return await getConnectionsByStatus(currentUserId, status);

            case 'getAll':
                return await getAllConnections(currentUserId);

            case 'updateStatus':
                if (!data.connectionId || !data.status) {
                    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters for updateStatus: connectionId, status');
                }
                return await updateConnectionStatus(data.connectionId, data.status);

            default:
                throw new functions.https.HttpsError('invalid-argument', 'Invalid action. Must be: check, create, remove, getByStatus, getAll, or updateStatus');
        }
    } catch (error) {
        console.error('Connection management error:', error);
        throw new functions.https.HttpsError('internal', 'Error managing connections: ' + error.message);
    }
});

async function checkConnection(currentUserId, targetUserId) {
    const connectionsRef = db.collection('connections');

    // Check for connection in both directions
    const connectionQuery1 = connectionsRef.where('initiateUserId', '==', currentUserId).where('targetUserId', '==', targetUserId);
    const connectionQuery2 = connectionsRef.where('initiateUserId', '==', targetUserId).where('targetUserId', '==', currentUserId);

    const [snapshot1, snapshot2] = await Promise.all([connectionQuery1.get(), connectionQuery2.get()]);

    const isConnected = !snapshot1.empty || !snapshot2.empty;
    let connectionData = null;

    if (isConnected) {
        const doc = snapshot1.empty ? snapshot2.docs[0] : snapshot1.docs[0];
        connectionData = {
            id: doc.id,
            ...doc.data()
        };
    }

    return {
        isConnected,
        connectionData
    };
}

async function createConnection(currentUserId, targetUserId, status) {
    // Check if connection already exists
    const existingConnection = await checkConnection(currentUserId, targetUserId);
    if (existingConnection.isConnected) {
        return {
            success: false,
            message: 'Connection already exists',
            isConnected: true,
            connectionData: existingConnection.connectionData
        };
    }

    // Create connection document
    const connectionRef = db.collection('connections').doc();

    const connectionData = {
        initiateUserId: currentUserId,
        targetUserId: targetUserId,
        status: status,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await connectionRef.set(connectionData);

    return {
        success: true,
        message: 'Connection created successfully',
        isConnected: true,
        connectionId: connectionRef.id
    };
}

async function removeConnection(currentUserId, targetUserId) {
    const connectionsRef = db.collection('connections');

    // Find and delete connection in both directions
    const connectionQuery1 = connectionsRef.where('initiateUserId', '==', currentUserId).where('targetUserId', '==', targetUserId);
    const connectionQuery2 = connectionsRef.where('initiateUserId', '==', targetUserId).where('targetUserId', '==', currentUserId);

    const [snapshot1, snapshot2] = await Promise.all([connectionQuery1.get(), connectionQuery2.get()]);

    const deletePromises = [];
    if (!snapshot1.empty) {
        deletePromises.push(snapshot1.docs[0].ref.delete());
    }
    if (!snapshot2.empty) {
        deletePromises.push(snapshot2.docs[0].ref.delete());
    }

    await Promise.all(deletePromises);

    return {
        success: true,
        message: 'Connection removed successfully',
        isConnected: false
    };
}

async function getConnectionsByStatus(currentUserId, status) {
    const connectionsRef = db.collection('connections');

    // Get connections where current user is either initiator or target
    const initiatorQuery = connectionsRef.where('initiateUserId', '==', currentUserId).where('status', '==', status);
    const targetQuery = connectionsRef.where('targetUserId', '==', currentUserId).where('status', '==', status);

    const [initiatorSnapshot, targetSnapshot] = await Promise.all([initiatorQuery.get(), targetQuery.get()]);

    const connections = [];

    // Process initiator connections
    initiatorSnapshot.docs.forEach(doc => {
        connections.push({
            id: doc.id,
            ...doc.data(),
            role: 'initiator'
        });
    });

    // Process target connections
    targetSnapshot.docs.forEach(doc => {
        connections.push({
            id: doc.id,
            ...doc.data(),
            role: 'target'
        });
    });

    return {
        success: true,
        connections,
        count: connections.length
    };
}

async function updateConnectionStatus(connectionId, newStatus) {
    const connectionRef = db.collection('connections').doc(connectionId);

    // Check if connection exists
    const connectionDoc = await connectionRef.get();
    if (!connectionDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Connection not found');
    }

    // Update the connection status
    await connectionRef.update({
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
        success: true,
        message: 'Connection status updated successfully',
        connectionId: connectionId,
        newStatus: newStatus
    };
}

async function getAllConnections(currentUserId) {
    const connectionsRef = db.collection('connections');

    // Get all connections where current user is either initiator or target
    const initiatorQuery = connectionsRef.where('initiateUserId', '==', currentUserId);
    const targetQuery = connectionsRef.where('targetUserId', '==', currentUserId);

    const [initiatorSnapshot, targetSnapshot] = await Promise.all([initiatorQuery.get(), targetQuery.get()]);

    const connections = [];

    // Process initiator connections
    initiatorSnapshot.docs.forEach(doc => {
        connections.push({
            id: doc.id,
            ...doc.data(),
            role: 'initiator'
        });
    });

    // Process target connections
    targetSnapshot.docs.forEach(doc => {
        connections.push({
            id: doc.id,
            ...doc.data(),
            role: 'target'
        });
    });

    return {
        success: true,
        connections,
        count: connections.length
    };
} 