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
        <h2 style="color: #1976d2;">Parental Consent Required</h2>
        <p>Hi${parentName ? ' ' + parentName : ''},</p>
        <p><b>${studentName}</b> is signing up for Launchpad and we require your consent to proceed.</p>
        <p>Please click the button below to review and approve their access:</p>
        <a href="${verificationLink}" style="display: inline-block; background: #1976d2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Review & Approve</a>
        <p style="margin-top: 32px; color: #888; font-size: 0.95em;">If you have questions, please contact our support team.</p>
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
        <h2 style="color: #1976d2;">Your Account is Approved! 🎉</h2>
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
        <h2 style="color: #1976d2;">Connection Approved! 🚀</h2>
        <p>Hi${studentName ? ' ' + studentName : ''},</p>
        <p>Awesome news! Your parent or guardian has approved your connection with${connectionName ? ' ' + connectionName : ' a new contact'} on Launchpad. You can now start connecting and learning together.</p>
        <a href="https://launchpadhouston.com" style="display: inline-block; background: #1976d2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Go to Launchpad</a>
        <p style="margin-top: 32px; color: #888; font-size: 0.95em;">We're thrilled to see you building your network. If you have any questions, reach out to our support team!</p>
        ${generateParentVerificationFooter({ unsubscribeLink })}
      </div>
    </div>
  `;
} 