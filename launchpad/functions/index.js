const admin = require("firebase-admin");

// Initialise exactly once, before any module that calls admin.firestore() at load time.
if (!admin.apps.length) {
  admin.initializeApp();
}

const {createStreamToken} = require("./callableFunctions/getStreamJWT");
const {sendInviteEmail} = require("./callableFunctions/sendInvite");
const {getEmail} = require("./callableFunctions/getEmail");
const {sendEmailNotifications} = require("./callableFunctions/sendEmailNotifications");
const {sendReport} = require("./callableFunctions/sendReport");
const {sendFeedback} = require("./callableFunctions/sendFeedback");
const {sendSESEmail} = require("./callableFunctions/sendSESEmail");
const {generateUnsubscribeLink, processUnsubscribe, checkUnsubscribeStatus} = require("./callableFunctions/generateUnsubscribeLink");
const {manageConnections} = require("./callableFunctions/manageConnections");
const {deleteMyAccount} = require("./callableFunctions/deleteMyAccount");
const {verifySocietyAccessCode, redeemSocietyAccessCode} = require("./callableFunctions/societyAccess");
// Graduation / migration emails for HS->College and College->Professional transitions (admin only).
const {sendGraduationEmails, sendMigrationReminders, scheduledGraduationEmails} = require("./callableFunctions/sendGraduationEmails");

const {onConnectionCreated, onConnectionStatusUpdated} = require("./triggers/connectionNotifications");
const {onOpportunityCreated} = require("./triggers/opportunityNotifications");
const {onWaitlistEntryCreated, resyncWaitlistToSheets} = require("./triggers/waitlistSync");
const {onSixDegreeApplicationCreated, resyncSixDegreeApplicationsToSheets} = require("./triggers/sixDegreeApplicationSync");
const {indexUserForSearch, indexOpportunityForSearch, indexSocietyOpportunityForSearch, onAdminTaskCreated} = require("./triggers/searchIndex");

// SECURITY: `deleteAuthUsers` (an unauthenticated HTTP endpoint that deleted every
// Firebase Auth user) has been removed. If it is still deployed, delete it with:
//   firebase functions:delete deleteAuthUsers
// The legacy school-version functions (createSchoolClaim, generateVerificationLink,
// verifyParentToken) are intentionally not exported.

exports.createStreamToken = createStreamToken;
exports.sendInviteEmail = sendInviteEmail;
exports.getEmail = getEmail;
exports.sendEmailNotifications = sendEmailNotifications;
exports.sendReport = sendReport;
exports.sendFeedback = sendFeedback;
exports.sendSESEmail = sendSESEmail;
exports.generateUnsubscribeLink = generateUnsubscribeLink;
exports.processUnsubscribe = processUnsubscribe;
exports.checkUnsubscribeStatus = checkUnsubscribeStatus;
exports.manageConnections = manageConnections;
exports.deleteMyAccount = deleteMyAccount;
exports.verifySocietyAccessCode = verifySocietyAccessCode;
exports.redeemSocietyAccessCode = redeemSocietyAccessCode;
exports.sendGraduationEmails = sendGraduationEmails;
exports.sendMigrationReminders = sendMigrationReminders;
exports.scheduledGraduationEmails = scheduledGraduationEmails;

exports.onConnectionCreated = onConnectionCreated;
exports.onConnectionStatusUpdated = onConnectionStatusUpdated;
exports.onOpportunityCreated = onOpportunityCreated;
exports.onWaitlistEntryCreated = onWaitlistEntryCreated;
exports.resyncWaitlistToSheets = resyncWaitlistToSheets;
exports.onSixDegreeApplicationCreated = onSixDegreeApplicationCreated;
exports.resyncSixDegreeApplicationsToSheets = resyncSixDegreeApplicationsToSheets;

// In-house search index (replaces Algolia/Typesense)
exports.indexUserForSearch = indexUserForSearch;
exports.indexOpportunityForSearch = indexOpportunityForSearch;
exports.indexSocietyOpportunityForSearch = indexSocietyOpportunityForSearch;
exports.onAdminTaskCreated = onAdminTaskCreated;
