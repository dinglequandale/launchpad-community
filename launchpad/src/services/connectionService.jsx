import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const manageConnections = httpsCallable(functions, 'manageConnections');

/**
 * Check if a connection exists between two users
 * @param {string} schoolId - The school ID
 * @param {string} targetUserId - The target user's ID
 * @returns {Promise<Object>} - Object containing isConnected boolean and connection data
 */
export const checkConnection = async (schoolId, targetUserId) => {
    try {
        const result = await manageConnections({
            action: 'check',
            schoolId,
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
 * @param {string} schoolId - The school ID
 * @param {string} targetUserId - The target user's ID
 * @param {string} status - The connection status (e.g., 'pending', 'accepted')
 * @param {string} userName - The target user's name
 * @returns {Promise<Object>} - Object containing success status and message
 */
export const createConnection = async (schoolId, targetUserId, status, userName) => {
    try {
        const result = await manageConnections({
            action: 'create',
            schoolId,
            targetUserId,
            status,
            userName
        });
        
        return result.data;
    } catch (error) {
        console.error('Error creating connection:', error);
        throw error;
    }
};

/**
 * Remove a connection between two users
 * @param {string} schoolId - The school ID
 * @param {string} targetUserId - The target user's ID
 * @returns {Promise<Object>} - Object containing success status and message
 */
export const removeConnection = async (schoolId, targetUserId) => {
    try {
        const result = await manageConnections({
            action: 'remove',
            schoolId,
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
 * @param {string} schoolId - The school ID
 * @param {string} status - The connection status to filter by
 * @returns {Promise<Object>} - Object containing connections array and count
 */
export const getConnectionsByStatus = async (schoolId, status) => {
    try {
        const result = await manageConnections({
            action: 'getByStatus',
            schoolId,
            status
        });
        
        return result.data;
    } catch (error) {
        console.error('Error getting connections by status:', error);
        throw error;
    }
};

/**
 * Add or update a connection with proper error handling
 * @param {Object} currentUser - The current user object
 * @param {Object} targetUser - The target user object
 * @param {string} status - The connection status
 * @param {string} userName - The target user's name
 * @param {Function} setIsConnection - Callback to update connection state
 * @returns {Promise<Object>} - Result of the connection operation
 */
export const addOrUpdateConnection = async (currentUser, targetUser, status, userName, setIsConnection) => {
    const schoolId = localStorage.getItem("schoolId");
    const targetUserId = targetUser.userId || targetUser.id;
    
    try {
        // First check if connection already exists
        const checkResult = await checkConnection(schoolId, targetUserId);
        
        if (checkResult.isConnected) {
            // Connection already exists
            setIsConnection && setIsConnection(true);
            return {
                success: false,
                message: 'Connection already exists',
                isConnected: true
            };
        }
        
        // Create new connection
        const createResult = await createConnection(schoolId, targetUserId, status, userName);
        
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