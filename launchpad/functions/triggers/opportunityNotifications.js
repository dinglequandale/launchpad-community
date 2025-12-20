const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Matching threshold - only send if match score is above this
const MATCH_THRESHOLD = 60; // 60% match or higher

// Maximum users to notify per opportunity (prevent spam)
const MAX_NOTIFICATIONS_PER_OPPORTUNITY = 50;

/**
 * Calculate match score between a user and an opportunity
 * Returns a score from 0-100
 */
function calculateOpportunityMatch(user, opportunity) {
    let score = 0;
    const maxScore = 100;

    // Check if user type is eligible for this opportunity
    const userTypeMapping = {
        "High Schooler": "highSchoolers",
        "College Student": "collegeStudents",
        "Professional": "professionals"
    };

    const applicantField = userTypeMapping[user.userType];

    // If user type doesn't match or opportunity doesn't accept this user type, return 0
    if (!applicantField || !opportunity.applicants || !opportunity.applicants[applicantField]) {
        return 0;
    }

    // Base score for being eligible user type
    score += 30;

    // Match on skills/tags (most important factor - 70 points)
    if (opportunity.organizationTags && opportunity.organizationTags.length > 0) {
        const userSkillDescriptions = (user.userSkills || []).map(s => s.skillDescription?.toLowerCase());
        const opportunityTags = opportunity.organizationTags.map(tag => tag.toLowerCase());

        // Calculate overlap
        const matchingTags = opportunityTags.filter(tag =>
            userSkillDescriptions.some(skill =>
                skill === tag || tag.includes(skill) || skill.includes(tag)
            )
        );

        if (matchingTags.length > 0) {
            // Score based on percentage of tags matched
            const matchPercentage = matchingTags.length / opportunityTags.length;
            score += Math.round(matchPercentage * 70);
        }
    }

    return Math.min(score, maxScore);
}

/**
 * Get user description for email (used in matching reasons)
 */
function getMatchReasons(user, opportunity, score) {
    const reasons = [];

    // Add user type reason
    if (user.userType) {
        const typeMap = {
            "High Schooler": "You're a high school student",
            "College Student": "You're a college student",
            "Professional": "You're a professional"
        };
        reasons.push(typeMap[user.userType] || `You're a ${user.userType}`);
    }

    // Add skill matches
    if (opportunity.organizationTags && user.userSkills) {
        const userSkillDescriptions = user.userSkills.map(s => s.skillDescription);
        const matchingSkills = opportunity.organizationTags.filter(tag =>
            userSkillDescriptions.some(skill =>
                skill.toLowerCase() === tag.toLowerCase() ||
                tag.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(tag.toLowerCase())
            )
        );

        if (matchingSkills.length > 0) {
            reasons.push(`Skills match: ${matchingSkills.slice(0, 3).join(', ')}`);
        }
    }

    return reasons;
}

/**
 * Generate unsubscribe token and link
 */
async function generateUnsubscribeLink(email, emailType) {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await db.collection('unsubscribe_tokens').doc(token).set({
        email: email.toLowerCase(),
        emailType,
        expiresAt,
        used: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return `https://launchpadhouston.com/unsubscribe?token=${token}`;
}

/**
 * Check if user has unsubscribed from a specific email type
 */
async function isUnsubscribed(email, emailType) {
    const unsubscribeDoc = await db.collection('unsubscribed_emails').doc(email.toLowerCase()).get();

    if (unsubscribeDoc.exists) {
        const unsubscribeData = unsubscribeDoc.data();
        if (!unsubscribeData.emailType || unsubscribeData.emailType === emailType) {
            return true;
        }
    }

    return false;
}

/**
 * Check if user has email notifications enabled
 */
async function hasEmailNotificationsEnabled(userId) {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
        return false;
    }

    const userData = userDoc.data();
    return userData.emailNotificationsEnabled !== false;
}

/**
 * Firestore onCreate trigger for opportunities
 * Finds matching users and sends email notifications
 */
exports.onOpportunityCreated = functions.firestore
    .document('opportunities/{opportunityId}')
    .onCreate(async (snap, context) => {
        const opportunityData = snap.data();
        const opportunityId = context.params.opportunityId;

        try {
            console.log(`New opportunity created: ${opportunityId}`);

            // Get all users from Firestore
            const usersSnapshot = await db.collection('users').get();

            if (usersSnapshot.empty) {
                console.log('No users found');
                return null;
            }

            // Calculate match scores for all users
            const userMatches = [];
            usersSnapshot.docs.forEach(userDoc => {
                const userData = userDoc.data();
                const userId = userDoc.id;
                const matchScore = calculateOpportunityMatch(userData, opportunityData);

                if (matchScore >= MATCH_THRESHOLD) {
                    userMatches.push({
                        userId,
                        userData,
                        matchScore,
                        matchReasons: getMatchReasons(userData, opportunityData, matchScore)
                    });
                }
            });

            // Sort by match score (highest first)
            userMatches.sort((a, b) => b.matchScore - a.matchScore);

            // Limit to top matches to avoid spam
            const topMatches = userMatches.slice(0, MAX_NOTIFICATIONS_PER_OPPORTUNITY);

            console.log(`Found ${topMatches.length} matching users for opportunity ${opportunityId}`);

            // Get opportunity creator info
            let creatorName = 'A Launchpad user';
            if (opportunityData.createdBy) {
                const creatorDoc = await db.collection('users').doc(opportunityData.createdBy).get();
                if (creatorDoc.exists) {
                    creatorName = creatorDoc.data().userName || creatorName;
                }
            }

            // Send emails to all matched users
            const emailPromises = topMatches.map(async (match) => {
                const { userId, userData, matchScore, matchReasons } = match;

                // Check if user has email notifications enabled
                const notificationsEnabled = await hasEmailNotificationsEnabled(userId);
                if (!notificationsEnabled) {
                    console.log(`User ${userId} has email notifications disabled`);
                    return null;
                }

                // Check if user has unsubscribed
                const unsubscribed = await isUnsubscribed(userData.email, 'opportunity_match');
                if (unsubscribed) {
                    console.log(`User ${userData.email} has unsubscribed from opportunity match emails`);
                    return null;
                }

                // Generate unsubscribe link
                const unsubscribeLink = await generateUnsubscribeLink(userData.email, 'opportunity_match');

                // Prepare email template data
                const recipientName = userData.userName?.split(' ')[0] || 'there';

                // Import email template
                const { opportunityMatchEmailTemplate } = require('../utils/emailTemplates');

                const emailHtml = opportunityMatchEmailTemplate(
                    recipientName,
                    opportunityData.title || opportunityData.applicantPosition,
                    opportunityData.organizationType || 'Opportunity',
                    opportunityData.organizationHostCompany || 'A company',
                    matchScore,
                    matchReasons,
                    opportunityData.deadline || null,
                    creatorName,
                    unsubscribeLink,
                    opportunityId
                );

                // Create email document for MailGun
                return db.collection('mail').add({
                    to: userData.email,
                    message: {
                        subject: `New ${opportunityData.organizationType || 'opportunity'}: ${opportunityData.title || opportunityData.applicantPosition || 'Check it out'}!`,
                        html: emailHtml,
                    },
                    from: 'Launchpad Networks <no-reply@launchpadhouston.com>',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'pending',
                    provider: 'mailgun',
                    emailType: 'opportunity_match',
                    unsubscribeLink,
                    metadata: {
                        opportunityId,
                        userId,
                        matchScore,
                        creatorId: opportunityData.createdBy
                    }
                });
            });

            await Promise.all(emailPromises.filter(p => p !== null));

            console.log(`Opportunity match emails queued for ${topMatches.length} users`);
            return null;

        } catch (error) {
            console.error('Error sending opportunity match notifications:', error);
            return null;
        }
    });
