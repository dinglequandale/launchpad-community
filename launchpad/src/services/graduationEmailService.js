import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendGraduationEmails = httpsCallable(functions, 'sendGraduationEmails');
const sendMigrationReminders = httpsCallable(functions, 'sendMigrationReminders');

/**
 * Service for handling graduation email functionality
 */
export class GraduationEmailService {
    /**
     * Send graduation emails to all graduating high schoolers
     * @param {string} schoolId - The school ID
     * @param {boolean} testMode - Whether to run in test mode (ignores month restriction)
     * @returns {Promise<Object>} Result of the email sending operation
     */
    static async sendGraduationEmails(schoolId, testMode = false) {
        try {
            const result = await sendGraduationEmails({
                schoolId: schoolId,
                testMode: testMode
            });
            return result.data;
        } catch (error) {
            console.error('Error sending graduation emails:', error);
            throw new Error(`Failed to send graduation emails: ${error.message}`);
        }
    }

    /**
     * Send migration reminder emails to users who haven't completed migration
     * @param {string} schoolId - The school ID
     * @param {number} daysAfterGraduation - Days after graduation to send reminders (default: 7)
     * @returns {Promise<Object>} Result of the reminder sending operation
     */
    static async sendMigrationReminders(schoolId, daysAfterGraduation = 7) {
        try {
            const result = await sendMigrationReminders({
                schoolId: schoolId,
                daysAfterGraduation: daysAfterGraduation
            });
            return result.data;
        } catch (error) {
            console.error('Error sending migration reminders:', error);
            throw new Error(`Failed to send migration reminders: ${error.message}`);
        }
    }

    /**
     * Check if it's the right time to send graduation emails (June)
     * @returns {boolean} True if it's June, false otherwise
     */
    static isGraduationEmailTime() {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        return currentMonth === 6; // June
    }

    /**
     * Get the current graduation year
     * @returns {number} Current year
     */
    static getCurrentGraduationYear() {
        return new Date().getFullYear();
    }

    /**
     * Format graduation email statistics for display
     * @param {Object} result - Result from sendGraduationEmails
     * @returns {string} Formatted message
     */
    static formatEmailResult(result) {
        if (result.success) {
            return `✅ ${result.message}\n📧 Recipients: ${result.recipientsCount}`;
        } else {
            return `❌ ${result.message}`;
        }
    }

    /**
     * Format migration reminder statistics for display
     * @param {Object} result - Result from sendMigrationReminders
     * @returns {string} Formatted message
     */
    static formatReminderResult(result) {
        if (result.success) {
            return `✅ ${result.message}\n📧 Recipients: ${result.recipientsCount}`;
        } else {
            return `❌ ${result.message}`;
        }
    }
}

export default GraduationEmailService;
