const express = require("express");
// const cors = require("cors");

const app = express();
// app.use(cors({origin: true}));

const {createStreamToken} = require("./callableFunctions/getStreamJWT");
const {sendInviteEmail} = require("./callableFunctions/sendInvite");
const {getEmail} = require("./callableFunctions/getEmail");
// COMMUNITY VERSION: Removed school claim function (no longer needed without tenant architecture)
// const {createSchoolClaim} = require("./callableFunctions/createSchoolClaim");
const {sendEmailNotifications} = require("./callableFunctions/sendEmailNotifications");
const {sendReport} = require("./callableFunctions/sendReport");
const {sendSESEmail} = require("./callableFunctions/sendSESEmail");
// COMMUNITY VERSION: Removed parent verification functions
// const {generateVerificationLink} = require("./callableFunctions/generateVerificationLink");
// const {verifyParentToken} = require("./callableFunctions/verifyParentToken");
const {deleteAuthUsers} = require("./callableFunctions/deleteAuthUsers");
const {generateUnsubscribeLink, processUnsubscribe, checkUnsubscribeStatus} = require("./callableFunctions/generateUnsubscribeLink");
const {manageConnections} = require("./callableFunctions/manageConnections");
// COMMUNITY VERSION: Removed graduation/migration email functions
// const {sendGraduationEmails, sendMigrationReminders, scheduledGraduationEmails} = require("./callableFunctions/sendGraduationEmails");

// Firestore triggers for connection notifications
const {onConnectionCreated, onConnectionStatusUpdated} = require("./triggers/connectionNotifications");

// Firestore triggers for opportunity notifications
const {onOpportunityCreated} = require("./triggers/opportunityNotifications");

exports.createStreamToken = createStreamToken;
exports.sendInviteEmail = sendInviteEmail;
exports.getEmail = getEmail;
// COMMUNITY VERSION: Removed school claim export
// exports.createSchoolClaim = createSchoolClaim;
exports.sendEmailNotifications = sendEmailNotifications;
exports.sendReport = sendReport;
exports.sendSESEmail = sendSESEmail;
// COMMUNITY VERSION: Removed parent verification exports
// exports.generateVerificationLink = generateVerificationLink;
// exports.verifyParentToken = verifyParentToken;
exports.deleteAuthUsers = deleteAuthUsers;
exports.generateUnsubscribeLink = generateUnsubscribeLink;
exports.processUnsubscribe = processUnsubscribe;
exports.checkUnsubscribeStatus = checkUnsubscribeStatus;
exports.manageConnections = manageConnections;
// COMMUNITY VERSION: Removed graduation/migration email exports
// exports.sendGraduationEmails = sendGraduationEmails;
// exports.sendMigrationReminders = sendMigrationReminders;
// exports.scheduledGraduationEmails = scheduledGraduationEmails;

// Connection notification triggers
exports.onConnectionCreated = onConnectionCreated;
exports.onConnectionStatusUpdated = onConnectionStatusUpdated;

// Opportunity notification triggers
exports.onOpportunityCreated = onOpportunityCreated;