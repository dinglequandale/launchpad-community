/**
 * Generate the standard footer for all parent verification emails
 * @param {Object} params
 * @param {string} [params.unsubscribeLink] - Optional unsubscribe link (will be replaced by placeholder)
 * @returns {string} HTML footer
 */
function generateParentVerificationFooter({ unsubscribeLink } = {}) {
  const currentYear = new Date().getFullYear();
  
  return `
    <div style="margin-top: 40px; text-align: center; font-size: 0.9em; color: #888;">
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <div style="margin-bottom: 16px;">
        By using Launchpad, you agree to our
        <a href="https://launchpadhouston.com/terms" style="color: #1976d2; text-decoration: underline;">Terms of Service</a>
        and
        <a href="https://launchpadhouston.com/privacy" style="color: #1976d2; text-decoration: underline;">Privacy Policy</a>.
      </div>
      <div style="margin-bottom: 16px;">
        <a href="\${unsubscribeLink}" style="color: #888; text-decoration: underline;">Unsubscribe from these emails</a>
      </div>
      <div style="color: #666; font-size: 0.85em;">
        © ${currentYear} Launchpad. All rights reserved.
      </div>
    </div>
  `;
}

/**
 * @param {Object} params
 * @param {string} params.studentName
 * @param {string} params.parentName
 * @param {string} params.verificationLink
 * @param {string} [params.unsubscribeLink] - Optional unsubscribe link
 * @returns {string} HTML email
 */
export function parentVerificationInitialTemplate({ studentName, parentName, verificationLink, unsubscribeLink="" }) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
      <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #1976d2;">Parental Consent Required for Launchpad Access</h2>
        <p>Dear${parentName ? ' ' + parentName : ' Parent/Guardian'},</p>
        <p><strong>${studentName}</strong> has requested to join Launchpad, a secure networking platform designed specifically for students to connect with professionals, alumni, and peers within their school community.</p>
        
        <div style="background: #f8f9fa; border-left: 4px solid #1976d2; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 12px 0; color: #1976d2; font-size: 16px;">What is Launchpad?</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">
            Launchpad is a professional networking platform that helps students build meaningful connections, discover career opportunities, and gain mentorship from experienced professionals and alumni. It's designed to be safe, educational, and beneficial for your child's future.
          </p>
        </div>
        
        <p>To ensure your child's safety and to comply with our platform's security protocols, we require your explicit consent before they can access the platform.</p>
        
        <p><strong>Please review and approve their access by clicking the button below:</strong></p>
        <a href="${verificationLink}" style="display: inline-block; background: #1976d2; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Review & Approve Access</a>
        
        <div style="margin-top: 32px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h4 style="margin: 0 0 12px 0; color: #333;">Join Launchpad Yourself</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">
            As a parent, you can also join Launchpad to stay connected with your child's network and potentially offer your own expertise to other students. Visit <a href="https://launchpadhouston.com" style="color: #1976d2;">launchpadhouston.com</a> to learn more.
          </p>
        </div>
        
        <p style="margin-top: 24px; color: #666; font-size: 14px;">If you have any questions or concerns, please don't hesitate to contact our support team at support@launchpadhouston.com.</p>
        ${generateParentVerificationFooter({ unsubscribeLink })}
      </div>
    </div>
  `;
}

/**
 * Resend parent verification email
 * @param {Object} params
 * @param {string} params.studentName
 * @param {string} params.parentName
 * @param {string} params.verificationLink
 * @param {string} [params.unsubscribeLink] - Optional unsubscribe link
 * @returns {string} HTML email
 */
export function parentVerificationResendTemplate({ studentName, parentName, verificationLink, unsubscribeLink="" }) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
      <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #1976d2;">Reminder: Parental Consent Needed</h2>
        <p>Hi${parentName ? ' ' + parentName : ''},</p>
        <p>This is a reminder that <b>${studentName}</b> is waiting for your approval to use Launchpad.</p>
        <p>Please click the button below to review and approve their access:</p>
        <a href="${verificationLink}" style="display: inline-block; background: #1976d2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Review & Approve</a>
        <p style="margin-top: 32px; color: #888; font-size: 0.95em;">If you have questions, please contact our support team.</p>
        ${generateParentVerificationFooter({ unsubscribeLink })}
      </div>
    </div>
  `;
}

/**
 * Parent verification for student connecting with a professional or alumni
 * @param {Object} params
 * @param {string} params.studentName
 * @param {string} params.parentName
 * @param {Object} params.professionalData
 * @param {string} params.verificationLink
 * @param {string} [params.connectionType] - "professional" or "alumni" (default: "professional")
 * @param {string} [params.unsubscribeLink] - Optional unsubscribe link
 * @returns {string} HTML email
 */
export function parentConnectionRequestTemplate({ studentName, parentName, professionalData, verificationLink, connectionType = "Professional", unsubscribeLink="" }) {
  let detailsBlock = "";
  console.log("prof after: ", professionalData);
  if (connectionType === "Professional") {
    detailsBlock = `
      <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: left;">
        <div style="font-weight: 600; margin-bottom: 8px;">Professional Details:</div>
        <div><strong>Name:</strong> ${professionalData.userName}</div>
        <div><strong>Position:</strong> ${professionalData.industryPosition || ""}${professionalData.companyName ? " at " + professionalData.companyName : ""}</div>
        ${professionalData.areasOfInterest && professionalData.areasOfInterest.length > 0
          ? `<div><strong>Expertise:</strong> ${professionalData.areasOfInterest.join(", ")}</div>`
          : ""}
        ${professionalData.linkedinLink
          ? `<div style="margin-top: 8px;"><strong>LinkedIn Profile:</strong> <a href="${professionalData.linkedinLink}" style="color: #1976d2; text-decoration: underline;">View Professional Profile</a></div>`
          : ""}
        ${professionalData.yearsOfExperience
          ? `<div><strong>Years of Experience:</strong> ${professionalData.yearsOfExperience}</div>`
          : ""}
      </div>
    `;
  } else if (connectionType === "Alumni") {
    detailsBlock = `
      <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: left;">
        <div style="font-weight: 600; margin-bottom: 8px;">Alumni Details:</div>
        <div><strong>Name:</strong> ${professionalData.userName}</div>
        <div><strong>College:</strong> ${professionalData.collegeAttending || ""}</div>
        ${professionalData.areasOfInterest && professionalData.areasOfInterest.length > 0
          ? `<div><strong>Fields of Study:</strong> ${professionalData.areasOfInterest.join(", ")}</div>`
          : ""}
        ${professionalData.linkedinLink
          ? `<div style="margin-top: 8px;"><strong>LinkedIn Profile:</strong> <a href="${professionalData.linkedinLink}" style="color: #1976d2; text-decoration: underline;">View Professional Profile</a></div>`
          : ""}
      </div>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
      <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #1976d2;">Connection Request Approval Needed</h2>
        <p>Hi${parentName ? ' ' + parentName : ''},</p>
        <p><b>${studentName}</b> would like to connect with <b>${professionalData.userName}</b> on Launchpad. Below are their credentials:</p>
        ${detailsBlock}
        <p>For safety, we require your approval before they can connect with ${connectionType === "professional" ? "professionals" : "alumni"}.</p>
        <a href="${verificationLink}" style="display: inline-block; background: #1976d2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Review & Approve Connection</a>
        <p style="margin-top: 32px; color: #888; font-size: 0.95em;">If you have questions, please contact our support team.</p>
        ${generateParentVerificationFooter({ unsubscribeLink })}
      </div>
    </div>
  `;
}

/**
 * Notify student their account was approved by their parent
 * @param {Object} params
 * @param {string} params.studentName
 * @param {string} [params.unsubscribeLink] - Optional unsubscribe link
 * @returns {string} HTML email
 */
export function studentAccountReminderTemplate({ studentName="", unsubscribeLink="" }) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
      <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #1976d2;">Your Account is Approved!</h2>
        <p>Hi${studentName ? ' ' + studentName : ''},</p>
        <p>Great news! Your parent or guardian has approved your Launchpad account. You can now log in and start exploring all the opportunities waiting for you.</p>
        <a href="https://launchpadhouston.com" style="display: inline-block; background: #1976d2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Go to Launchpad</a>
        <p style="margin-top: 32px; color: #888; font-size: 0.95em;">We're excited to have you on board. If you have any questions, reach out to our support team!</p>
        ${generateParentVerificationFooter({ unsubscribeLink })}
      </div>
    </div>
  `;
}

/**
 * Notify student their connection was approved by their parent
 * @param {Object} params
 * @param {string} params.studentName
 * @param {string} params.connectionName
 * @param {string} [params.unsubscribeLink] - Optional unsubscribe link
 * @returns {string} HTML email
 */
export function studentConnectionReminderTemplate({ studentName="", connectionName, unsubscribeLink="" }) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
      <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #1976d2;">Connection Approved!</h2>
        <p>Hi${studentName ? ' ' + studentName : ''},</p>
        <p>Great news! Your parent or guardian has approved your connection with${connectionName ? ' ' + connectionName : ' a new contact'} on Launchpad. You can now start connecting and learning together.</p>
        <a href="https://launchpadhouston.com" style="display: inline-block; background: #1976d2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Go to Launchpad</a>
        <p style="margin-top: 32px; color: #888; font-size: 0.95em;">We're thrilled to see you building your network. If you have any questions, reach out to our support team!</p>
        ${generateParentVerificationFooter({ unsubscribeLink })}
      </div>
    </div>
  `;
} 