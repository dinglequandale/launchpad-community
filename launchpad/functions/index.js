const express = require("express");
// const cors = require("cors");

const app = express();
// app.use(cors({origin: true}));

const {createStreamToken} = require("./callableFunctions/getStreamJWT");
const {sendInviteEmail} = require("./callableFunctions/sendInvite");
const {getEmail} = require("./callableFunctions/getEmail");
const {createSchoolClaim} = require("./callableFunctions/createSchoolClaim");

exports.createStreamToken = createStreamToken;
exports.sendInviteEmail = sendInviteEmail;
exports.getEmail = getEmail;
exports.createSchoolClaim = createSchoolClaim;