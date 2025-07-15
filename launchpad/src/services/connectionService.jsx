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
 * @param {string} userType - The current user's type
 * @param {string} targetUserType - The target user's type
 * @returns {Promise<Object>} - Object containing success status and message
 */
export const createConnection = async (schoolId, targetUserId, status, userType, targetUserType) => {
    try {
        const result = await manageConnections({
            action: 'create',
            schoolId,
            targetUserId,
            status,
            userType,
            targetUserType
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
 * Get all connections for the current user
 * @param {string} schoolId - The school ID
 * @returns {Promise<Object>} - Object containing connections array and count
 */
export const getAllConnections = async (schoolId) => {
    try {
        const result = await manageConnections({
            action: 'getAll',
            schoolId
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
export const addOrUpdateConnection = async (currentUser, targetUser, status, setIsConnection, isHighSchooler=false) => {
    const schoolId = localStorage.getItem("schoolId");
    const targetUserId = targetUser.userId || targetUser.id;
    const userType = currentUser.userType || currentUser.type;
    const targetUserType = targetUser.userType || targetUser.type;
    
    if(isHighSchooler){
        const pending = JSON.parse(localStorage.getItem("pendingConnections")) || [];
        localStorage.setItem("pendingConnections", JSON.stringify([...pending, targetUserId]));
        return;
    }

    try {
        // First check if connection already exists
        const checkResult = await checkConnection(schoolId, targetUserId);
        
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
        const createResult = await createConnection(schoolId, targetUserId, status, userType, targetUserType);
        
        // Update local state
        setIsConnection && setIsConnection(createResult.isConnected);
        
        // Handle pending connections in localStorage
        if (status === "pending" || createResult.needsParentalApproval) {
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

export function isConnectionApproved(currentUserType, currentUser, targetUser, parent_approved, approved, parentVerified) {
    // If not a high schooler connecting to a professional, always approved
    if (!currentUser || !targetUser) return false;
    if (currentUserType !== 'High Schooler' || targetUser.userType === 'High Schooler') {
        return true;
    }
    if (!parentVerified) {
        return false;
    }
    const total_approved = [...parent_approved, ...approved];
    return total_approved.some(conn =>
        (conn.initiateUserId === currentUser.uid && (conn.targetUserId === targetUser.id || conn.targetUserId === targetUser.userId)) ||
        (conn.initiateUserId === (targetUser.id || targetUser.userId) && conn.targetUserId === currentUser.uid)
    );
} 