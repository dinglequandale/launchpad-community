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
        throw new functions.https.HttpsError('unauthenticatePd', 'Only authenticated users can manage connections.');
    }

    const { action, schoolId, targetUserId, status, userName } = data;
    const currentUserId = context.auth.uid;

    // Validate required parameters
    if (!action || !schoolId || !targetUserId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters: action, schoolId, targetUserId');
    }

    try {
        switch (action) {
            case 'check':
                return await checkConnection(schoolId, currentUserId, targetUserId);
            
            case 'create':
                if (!status || !userName) {
                    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters for create: status, userName');
                }
                return await createConnection(schoolId, currentUserId, targetUserId, status, userName);
            
            case 'remove':
                return await removeConnection(schoolId, currentUserId, targetUserId);
            
            case 'getByStatus':
                if (!status) {
                    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameter: status');
                }
                return await getConnectionsByStatus(schoolId, currentUserId, status);
            
            default:
                throw new functions.https.HttpsError('invalid-argument', 'Invalid action. Must be: check, create, remove, or getByStatus');
        }
    } catch (error) {
        console.error('Connection management error:', error);
        throw new functions.https.HttpsError('internal', 'Error managing connections: ' + error.message);
    }
});

async function checkConnection(schoolId, currentUserId, targetUserId) {
    const connectionsRef = db.collection('tenants').doc(schoolId)
        .collection('users').doc(currentUserId)
        .collection('connections');
    
    const existingConnectionQuery = connectionsRef.where('userId', '==', targetUserId);
    const existingConnectionSnapshot = await existingConnectionQuery.get();
    
    const isConnected = !existingConnectionSnapshot.empty;
    
    return {
        isConnected,
        connectionData: isConnected ? existingConnectionSnapshot.docs[0].data() : null
    };
}

async function createConnection(schoolId, currentUserId, targetUserId, status, userName) {
    // Check if connection already exists
    const existingConnection = await checkConnection(schoolId, currentUserId, targetUserId);
    if (existingConnection.isConnected) {
        return {
            success: false,
            message: 'Connection already exists',
            isConnected: true
        };
    }

    // Create connection documents for both users
    const currentUserConnRef = db.collection('tenants').doc(schoolId)
        .collection('users').doc(currentUserId)
        .collection('connections').doc(targetUserId);
    
    const targetUserConnRef = db.collection('tenants').doc(schoolId)
        .collection('users').doc(targetUserId)
        .collection('connections').doc(currentUserId);

    const batch = db.batch();

    // Add connection for current user
    batch.set(currentUserConnRef, {
        userId: targetUserId,
        status: status,
        userName: userName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Add connection for target user (without status for now)
    batch.set(targetUserConnRef, {
        userId: currentUserId,
        userName: userName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    return {
        success: true,
        message: 'Connection created successfully',
        isConnected: true
    };
}

async function removeConnection(schoolId, currentUserId, targetUserId) {
    const currentUserConnRef = db.collection('tenants').doc(schoolId)
        .collection('users').doc(currentUserId)
        .collection('connections').doc(targetUserId);
    
    const targetUserConnRef = db.collection('tenants').doc(schoolId)
        .collection('users').doc(targetUserId)
        .collection('connections').doc(currentUserId);

    const batch = db.batch();
    
    // Remove connection from both users
    batch.delete(currentUserConnRef);
    batch.delete(targetUserConnRef);

    await batch.commit();

    return {
        success: true,
        message: 'Connection removed successfully',
        isConnected: false
    };
}

async function getConnectionsByStatus(schoolId, currentUserId, status) {
    const connectionsRef = db.collection('tenants').doc(schoolId)
        .collection('users').doc(currentUserId)
        .collection('connections');
    
    const statusQuery = connectionsRef.where('status', '==', status);
    const snapshot = await statusQuery.get();
    
    const connections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return {
        success: true,
        connections,
        count: connections.length
    };
} 