const express = require("express");
// const cors = require("cors");

const app = express();
// app.use(cors({origin: true}));

const {createStreamToken} = require("./callableFunctions/getStreamJWT");
const {sendInviteEmail} = require("./callableFunctions/sendInvite");
const {getEmail} = require("./callableFunctions/getEmail");
const {createSchoolClaim} = require("./callableFunctions/createSchoolClaim");
const {sendEmailNotifications} = require("./callableFunctions/sendEmailNotifications");
const {sendReport} = require("./callableFunctions/sendReport");
const {sendSESEmail} = require("./callableFunctions/sendSESEmail");
const {generateVerificationLink} = require("./callableFunctions/generateVerificationLink");
const {verifyParentToken} = require("./callableFunctions/verifyParentToken");

exports.createStreamToken = createStreamToken;
exports.sendInviteEmail = sendInviteEmail;
exports.getEmail = getEmail;
exports.createSchoolClaim = createSchoolClaim;
exports.sendEmailNotifications = sendEmailNotifications;
exports.sendReport = sendReport;
exports.sendSESEmail = sendSESEmail;
exports.generateVerificationLink = generateVerificationLink;
exports.verifyParentToken = verifyParentToken;