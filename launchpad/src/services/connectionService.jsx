import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const manageConnections = httpsCallable(functions, 'manageConnections');

/**
 * Check if a connection exists between two users
 * @param {string} targetUserId - The target user's ID
 * @returns {Promise<Object>} - Object containing isConnected boolean and connection data
 */
// COMMUNITY VERSION: Removed schoolId parameter
export const checkConnection = async (targetUserId) => {
    try {
        const result = await manageConnections({
            action: 'check',
            targetUserId
        });

        return result.data;
    } catch (error) {
        console.error('Error checking connection:', error);
        throw error;
    }
};

/**
 * Create a connection between two users
 * @param {string} targetUserId - The target user's ID
 * @param {string} status - The connection status (e.g., 'pending', 'accepted')
 * @returns {Promise<Object>} - Object containing success status and message
 */
// COMMUNITY VERSION: Removed schoolId and user type parameters
export const createConnection = async (targetUserId, status) => {
    try {
        const result = await manageConnections({
            action: 'create',
            targetUserId,
            status
        });

        return result.data;
    } catch (error) {
        console.error('Error creating connection:', error);
        throw error;
    }
};

/**
 * Remove a connection between two users
 * @param {string} targetUserId - The target user's ID
 * @returns {Promise<Object>} - Object containing success status and message
 */
// COMMUNITY VERSION: Removed schoolId parameter
export const removeConnection = async (targetUserId) => {
    try {
        const result = await manageConnections({
            action: 'remove',
            targetUserId
        });

        return result.data;
    } catch (error) {
        console.error('Error removing connection:', error);
        throw error;
    }
};

/**
 * Get connections by status for the current user
 * @param {string} status - The connection status to filter by
 * @returns {Promise<Object>} - Object containing connections array and count
 */
// COMMUNITY VERSION: Removed schoolId parameter
export const getConnectionsByStatus = async (status) => {
    try {
        const result = await manageConnections({
            action: 'getByStatus',
            status
        });

        return result.data;
    } catch (error) {
        console.error('Error getting connections by status:', error);
        throw error;
    }
};

/**
 * Get all connections for the current user
 * @returns {Promise<Object>} - Object containing connections array and count
 */
// COMMUNITY VERSION: Removed schoolId parameter
export const getAllConnections = async () => {
    try {
        const result = await manageConnections({
            action: 'getAll'
        });

        return result.data;
    } catch (error) {
        console.error('Error getting all connections:', error);
        throw error;
    }
};

/**
 * Add or update a connection with proper error handling
 * @param {Object} currentUser - The current user object
 * @param {Object} targetUser - The target user object
 * @param {string} status - The connection status
 * @param {Function} setIsConnection - Callback to update connection state
 * @returns {Promise<Object>} - Result of the connection operation
 */
// COMMUNITY VERSION: Simplified connection logic (removed parent approval and type restrictions)
export const addOrUpdateConnection = async (currentUser, targetUser, status, setIsConnection) => {
    const targetUserId = targetUser.userId || targetUser.id;

    try {
        // First check if connection already exists
        const checkResult = await checkConnection(targetUserId);

        if (checkResult.isConnected) {
            // Connection already exists
            setIsConnection && setIsConnection(true);
            return {
                success: false,
                message: 'Connection already exists',
                isConnected: true,
                connectionData: checkResult.connectionData
            };
        }

        // Create new connection
        const createResult = await createConnection(targetUserId, status);

        // Update local state
        setIsConnection && setIsConnection(createResult.isConnected);

        // Handle pending connections in localStorage
        if (status === "pending") {
            const pending = JSON.parse(localStorage.getItem("pendingConnections")) || [];
            localStorage.setItem("pendingConnections", JSON.stringify([...pending, targetUserId]));
        }

        return createResult;
    } catch (error) {
        console.error('Error in addOrUpdateConnection:', error);
        setIsConnection && setIsConnection(false);
        throw error;
    }
}; 

// COMMUNITY VERSION: Removed all user type restrictions and parent verification
export function isConnectionApproved(currentUserType, currentUser, targetUser, approved) {
    if (!currentUser || !targetUser) return false;

    // All users can connect with each other in the community version
    return approved.some(conn =>
        (conn.initiateUserId === currentUser.uid && (conn.targetUserId === targetUser.id || conn.targetUserId === targetUser.userId)) ||
        (conn.initiateUserId === (targetUser.id || targetUser.userId) && conn.targetUserId === currentUser.uid)
    );
} 