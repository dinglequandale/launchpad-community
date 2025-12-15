/**
 * General Email Templates for Launchpad
 * Contains reusable email templates for various system communications
 */

exports.graduationEmailTemplate = (userName, schoolName, migrationLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Congratulations on Your Graduation!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo img {
                max-width: 200px;
                height: auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #2c5282;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .header h2 {
                color: #4a5568;
                font-size: 20px;
                font-weight: normal;
            }
            .content {
                margin-bottom: 30px;
            }
            .content p {
                margin-bottom: 15px;
                font-size: 16px;
            }
            .highlight {
                background-color: #e6fffa;
                border-left: 4px solid #38b2ac;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background-color: #2c5282;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #2a4a7c;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .benefits {
                background-color: #f7fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .benefits h3 {
                color: #2c5282;
                margin-bottom: 15px;
            }
            .benefits ul {
                margin: 0;
                padding-left: 20px;
            }
            .benefits li {
                margin-bottom: 8px;
                color: #4a5568;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 14px;
            }
            .unsubscribe {
                margin-top: 20px;
                font-size: 12px;
                color: #a0aec0;
            }
            .unsubscribe a {
                color: #a0aec0;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo">
                <img src="https://launchpadhouston.com/assets/launchpad_logo.png" alt="Launchpad Logo">
            </div>
            
            <div class="header">
                <h1>🎓 Congratulations on Your Graduation!</h1>
                <h2>Class of ${new Date().getFullYear()}</h2>
            </div>
            
            <div class="content">
                <p>Dear ${userName},</p>
                
                <p>Congratulations on graduating from ${schoolName}! This is such an exciting milestone in your life, and we're thrilled to celebrate this achievement with you.</p>
                
                <div class="highlight">
                    <strong>Your journey doesn't end here!</strong> As you transition from high school to college and beyond, we want to help you stay connected to your school community and continue growing your network.
                </div>
                
                <p>We're excited to invite you to migrate your Launchpad account to our Alumni network. This will allow you to:</p>
                
                <div class="benefits">
                    <h3>🌟 What You'll Gain as an Alumni:</h3>
                    <ul>
                        <li><strong>Mentor Current Students:</strong> Share your experiences and insights with the next generation</li>
                        <li><strong>Connect with Fellow Alumni:</strong> Build relationships with graduates from your school</li>
                        <li><strong>Access Professional Opportunities:</strong> Discover internships, jobs, and career guidance</li>
                        <li><strong>Give Back to Your Community:</strong> Help current students navigate their academic and career journeys</li>
                        <li><strong>Stay Updated:</strong> Keep in touch with school news and events</li>
                    </ul>
                </div>
                
                <p>The migration process is quick and easy - we'll preserve all your existing profile information and simply add the new alumni-specific features you'll need.</p>
            </div>
            
            <div class="button-container">
                <a href="${migrationLink}" class="button">Migrate to Alumni Account</a>
            </div>
            
            <div class="content">
                <p>This migration will help you maintain your connection to the ${schoolName} community while opening up new opportunities for networking and mentorship.</p>
                
                <p>If you have any questions about the migration process or need assistance, please don't hesitate to reach out to our support team at <a href="mailto:launchpadhelpline@gmail.com">launchpadhelpline@gmail.com</a>.</p>
                
                <p>Congratulations again on your graduation, and we look forward to continuing to support you on your journey!</p>
                
                <p>Best regards,<br>
                <strong>The Launchpad Team</strong></p>
            </div>
            
            <div class="footer">
                <p>This email was sent to you because you are a graduating high school student on Launchpad.</p>
                <div class="unsubscribe">
                    <a href="\${unsubscribeLink}">Unsubscribe from graduation emails</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

exports.migrationReminderEmailTemplate = (userName, schoolName, migrationLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Don't Miss Out - Complete Your Alumni Migration</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo img {
                max-width: 200px;
                height: auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #e53e3e;
                font-size: 24px;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .content p {
                margin-bottom: 15px;
                font-size: 16px;
            }
            .urgent {
                background-color: #fed7d7;
                border-left: 4px solid #e53e3e;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background-color: #e53e3e;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #c53030;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 14px;
            }
            .unsubscribe {
                margin-top: 20px;
                font-size: 12px;
                color: #a0aec0;
            }
            .unsubscribe a {
                color: #a0aec0;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo">
                <img src="https://launchpadhouston.com/assets/launchpad_logo.png" alt="Launchpad Logo">
            </div>
            
            <div class="header">
                <h1>⏰ Don't Miss Out!</h1>
            </div>
            
            <div class="content">
                <p>Hi ${userName},</p>
                
                <p>We noticed you haven't completed your alumni account migration yet. As a recent graduate of ${schoolName}, you're missing out on valuable opportunities to connect with your school community and advance your career.</p>
                
                <div class="urgent">
                    <strong>Time is running out!</strong> Complete your migration now to unlock exclusive alumni benefits and networking opportunities.
                </div>
                
                <p>The migration process takes less than 5 minutes and will give you access to:</p>
                <ul>
                    <li>Alumni networking opportunities</li>
                    <li>Mentorship programs</li>
                    <li>Professional development resources</li>
                    <li>Career guidance and job opportunities</li>
                </ul>
            </div>
            
            <div class="button-container">
                <a href="${migrationLink}" class="button">Complete Migration Now</a>
            </div>
            
            <div class="content">
                <p>If you're having trouble with the migration or have questions, please contact us at <a href="mailto:launchpadhelpline@gmail.com">launchpadhelpline@gmail.com</a>.</p>
                
                <p>Best regards,<br>
                <strong>The Launchpad Team</strong></p>
            </div>
            
            <div class="footer">
                <p>This is a reminder email for your pending alumni account migration.</p>
                <div class="unsubscribe">
                    <a href="\${unsubscribeLink}">Unsubscribe from migration reminders</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

exports.migrationSuccessEmailTemplate = (userName, schoolName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to the Alumni Network!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo img {
                max-width: 200px;
                height: auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #38a169;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .success {
                background-color: #c6f6d5;
                border-left: 4px solid #38a169;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .content {
                margin-bottom: 30px;
            }
            .content p {
                margin-bottom: 15px;
                font-size: 16px;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background-color: #38a169;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #2f855a;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo">
                <img src="https://launchpadhouston.com/assets/launchpad_logo.png" alt="Launchpad Logo">
            </div>
            
            <div class="header">
                <h1>🎉 Welcome to the Alumni Network!</h1>
            </div>
            
            <div class="content">
                <p>Dear ${userName},</p>
                
                <div class="success">
                    <strong>Congratulations!</strong> Your account has been successfully migrated to the ${schoolName} Alumni network.
                </div>
                
                <p>You now have access to all the exclusive alumni features and can start connecting with fellow graduates, mentoring current students, and exploring professional opportunities.</p>
                
                <p>Here's what you can do next:</p>
                <ul>
                    <li>Update your college and career information</li>
                    <li>Connect with other alumni from your graduating class</li>
                    <li>Explore mentorship opportunities with current students</li>
                    <li>Share professional opportunities and insights</li>
                </ul>
            </div>
            
            <div class="button-container">
                <a href="https://launchpadhouston.com/Home" class="button">Access Your Alumni Dashboard</a>
            </div>
            
            <div class="content">
                <p>Thank you for staying connected to the ${schoolName} community. We're excited to see how you'll contribute to the next generation of students!</p>
                
                <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team at <a href="mailto:launchpadhelpline@gmail.com">launchpadhelpline@gmail.com</a>.</p>
                
                <p>Welcome to the alumni family!<br>
                <strong>The Launchpad Team</strong></p>
            </div>
            
            <div class="footer">
                <p>You're receiving this email because you successfully completed your alumni account migration.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Connection Request Email Template
 * Sent when someone sends a connection request
 */
exports.connectionRequestEmailTemplate = (recipientName, senderName, senderUserType, senderDescription, senderPfp, unsubscribeLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Connection Request</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo img {
                max-width: 200px;
                height: auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #2c5282;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .content p {
                margin-bottom: 15px;
                font-size: 16px;
            }
            .user-card {
                background-color: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .user-card img {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
            }
            .user-card .user-info h3 {
                margin: 0 0 5px 0;
                color: #2c5282;
                font-size: 18px;
            }
            .user-card .user-info p {
                margin: 0;
                color: #4a5568;
                font-size: 14px;
            }
            .user-type-badge {
                display: inline-block;
                background-color: #e6fffa;
                color: #234e52;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                margin-top: 5px;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background-color: #2c5282;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #2a4a7c;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 14px;
            }
            .unsubscribe {
                margin-top: 20px;
                font-size: 12px;
                color: #a0aec0;
            }
            .unsubscribe a {
                color: #a0aec0;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo">
                <img src="https://launchpadhouston.com/assets/launchpad_logo.png" alt="Launchpad Logo">
            </div>

            <div class="header">
                <h1>🔗 New Connection Request</h1>
            </div>

            <div class="content">
                <p>Hi ${recipientName},</p>

                <p><strong>${senderName}</strong> wants to connect with you on Launchpad!</p>

                <div class="user-card">
                    ${senderPfp ? `<img src="${senderPfp}" alt="${senderName}">` : `
                    <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #4a5568;">
                        ${senderName.charAt(0).toUpperCase()}
                    </div>
                    `}
                    <div class="user-info">
                        <h3>${senderName}</h3>
                        <span class="user-type-badge">${senderUserType}</span>
                        <p>${senderDescription}</p>
                    </div>
                </div>

                <p>Connecting with ${senderName} can help you expand your network, discover new opportunities, and gain valuable insights!</p>
            </div>

            <div class="button-container">
                <a href="https://launchpadhouston.com/Home" class="button">View Connection Request</a>
            </div>

            <div class="content">
                <p>You can accept or decline this request from your Launchpad dashboard.</p>
            </div>

            <div class="footer">
                <p>You're receiving this email because someone sent you a connection request on Launchpad.</p>
                <div class="unsubscribe">
                    <a href="${unsubscribeLink}">Unsubscribe from connection notifications</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Connection Accepted Email Template
 * Sent when someone accepts your connection request
 */
exports.connectionAcceptedEmailTemplate = (recipientName, accepterName, accepterUserType, accepterDescription, accepterPfp, unsubscribeLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connection Request Accepted</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo img {
                max-width: 200px;
                height: auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #38a169;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .content p {
                margin-bottom: 15px;
                font-size: 16px;
            }
            .user-card {
                background-color: #f0fff4;
                border: 1px solid #9ae6b4;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .user-card img {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
            }
            .user-card .user-info h3 {
                margin: 0 0 5px 0;
                color: #22543d;
                font-size: 18px;
            }
            .user-card .user-info p {
                margin: 0;
                color: #2f855a;
                font-size: 14px;
            }
            .user-type-badge {
                display: inline-block;
                background-color: #c6f6d5;
                color: #22543d;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                margin-top: 5px;
            }
            .success-banner {
                background-color: #c6f6d5;
                border-left: 4px solid #38a169;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background-color: #38a169;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #2f855a;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 14px;
            }
            .unsubscribe {
                margin-top: 20px;
                font-size: 12px;
                color: #a0aec0;
            }
            .unsubscribe a {
                color: #a0aec0;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo">
                <img src="https://launchpadhouston.com/assets/launchpad_logo.png" alt="Launchpad Logo">
            </div>

            <div class="header">
                <h1>✅ Connection Request Accepted!</h1>
            </div>

            <div class="content">
                <p>Hi ${recipientName},</p>

                <div class="success-banner">
                    <strong>Great news!</strong> ${accepterName} accepted your connection request on Launchpad.
                </div>

                <div class="user-card">
                    ${accepterPfp ? `<img src="${accepterPfp}" alt="${accepterName}">` : `
                    <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #c6f6d5; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #22543d;">
                        ${accepterName.charAt(0).toUpperCase()}
                    </div>
                    `}
                    <div class="user-info">
                        <h3>${accepterName}</h3>
                        <span class="user-type-badge">${accepterUserType}</span>
                        <p>${accepterDescription}</p>
                    </div>
                </div>

                <p>You can now message ${accepterName}, share opportunities, and collaborate!</p>
            </div>

            <div class="button-container">
                <a href="https://launchpadhouston.com/chat" class="button">Send a Message</a>
            </div>

            <div class="content">
                <p>Start building your relationship by sending a message or exploring ways you can help each other succeed.</p>
            </div>

            <div class="footer">
                <p>You're receiving this email because your connection request was accepted on Launchpad.</p>
                <div class="unsubscribe">
                    <a href="${unsubscribeLink}">Unsubscribe from connection notifications</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Opportunity Match Email Template
 * Sent when a new opportunity matches user's interests/skills
 */
exports.opportunityMatchEmailTemplate = (recipientName, opportunityTitle, opportunityType, companyName, matchScore, matchReasons, deadline, postedBy, unsubscribeLink, opportunityId) => {
  const deadlineText = deadline ? new Date(deadline.seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Opportunity Matches Your Profile!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo img {
                max-width: 200px;
                height: auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #5a67d8;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .content p {
                margin-bottom: 15px;
                font-size: 16px;
            }
            .opportunity-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
            }
            .opportunity-card h2 {
                margin: 0 0 10px 0;
                font-size: 24px;
                font-weight: bold;
            }
            .opportunity-card .company {
                font-size: 18px;
                opacity: 0.9;
                margin-bottom: 15px;
            }
            .opportunity-card .type-badge {
                display: inline-block;
                background-color: rgba(255, 255, 255, 0.2);
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            .match-score {
                background-color: #fef3c7;
                border: 2px solid #fbbf24;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
            }
            .match-score .score {
                font-size: 36px;
                font-weight: bold;
                color: #d97706;
                margin-bottom: 5px;
            }
            .match-score .label {
                font-size: 14px;
                color: #92400e;
            }
            .match-reasons {
                background-color: #f0fdf4;
                border-left: 4px solid #10b981;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .match-reasons h3 {
                color: #065f46;
                margin: 0 0 15px 0;
                font-size: 18px;
            }
            .match-reasons ul {
                margin: 0;
                padding-left: 20px;
            }
            .match-reasons li {
                margin-bottom: 8px;
                color: #047857;
            }
            .deadline-alert {
                background-color: #fee2e2;
                border: 1px solid #fca5a5;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
            }
            .deadline-alert .icon {
                font-size: 24px;
                margin-bottom: 5px;
            }
            .deadline-alert .text {
                color: #991b1b;
                font-weight: 600;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background-color: #5a67d8;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #4c51bf;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 14px;
            }
            .unsubscribe {
                margin-top: 20px;
                font-size: 12px;
                color: #a0aec0;
            }
            .unsubscribe a {
                color: #a0aec0;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo">
                <img src="https://launchpadhouston.com/assets/launchpad_logo.png" alt="Launchpad Logo">
            </div>

            <div class="header">
                <h1>🎯 Perfect Match!</h1>
            </div>

            <div class="content">
                <p>Hi ${recipientName},</p>

                <p>Great news! We found an opportunity that matches your profile perfectly!</p>

                <div class="opportunity-card">
                    <div class="type-badge">${opportunityType}</div>
                    <h2>${opportunityTitle}</h2>
                    <div class="company">📍 ${companyName}</div>
                </div>

                <div class="match-score">
                    <div class="score">${matchScore}%</div>
                    <div class="label">Match Score</div>
                </div>

                <div class="match-reasons">
                    <h3>✨ Why this is a great match for you:</h3>
                    <ul>
                        ${matchReasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>

                ${deadlineText ? `
                <div class="deadline-alert">
                    <div class="icon">⏰</div>
                    <div class="text">Application Deadline: ${deadlineText}</div>
                </div>
                ` : ''}

                <p>This opportunity was posted by <strong>${postedBy}</strong> and is now available on Launchpad!</p>
            </div>

            <div class="button-container">
                <a href="https://launchpadhouston.com/organization/${opportunityId}" class="button">View Opportunity</a>
            </div>

            <div class="content">
                <p>Don't miss out on this perfect opportunity to advance your career and build valuable connections!</p>
            </div>

            <div class="footer">
                <p>You're receiving this email because a new opportunity matches your skills and interests.</p>
                <div class="unsubscribe">
                    <a href="${unsubscribeLink}">Unsubscribe from opportunity match notifications</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * New Message Email Template
 * Sent when someone sends you a message on the platform
 */
exports.newMessageEmailTemplate = (recipientName, senderName, messagePreview, unsubscribeLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Message from ${senderName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo img {
                max-width: 200px;
                height: auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #4299e1;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .content p {
                margin-bottom: 15px;
                font-size: 16px;
            }
            .message-card {
                background-color: #f7fafc;
                border-left: 4px solid #4299e1;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            .message-card .sender {
                font-weight: bold;
                color: #2c5282;
                margin-bottom: 10px;
                font-size: 18px;
            }
            .message-card .preview {
                color: #4a5568;
                font-style: italic;
                line-height: 1.8;
                padding: 15px;
                background-color: #ffffff;
                border-radius: 4px;
                margin-top: 10px;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background-color: #4299e1;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #3182ce;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 14px;
            }
            .unsubscribe {
                margin-top: 20px;
                font-size: 12px;
                color: #a0aec0;
            }
            .unsubscribe a {
                color: #a0aec0;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo">
                <img src="https://launchpadhouston.com/assets/launchpad_logo.png" alt="Launchpad Logo">
            </div>

            <div class="header">
                <h1>💬 New Message</h1>
            </div>

            <div class="content">
                <p>Hi ${recipientName},</p>

                <p>You have a new message on Launchpad!</p>

                <div class="message-card">
                    <div class="sender">From: ${senderName}</div>
                    <div class="preview">"${messagePreview}"</div>
                </div>

                <p>Reply to ${senderName} and continue your conversation!</p>
            </div>

            <div class="button-container">
                <a href="https://launchpadhouston.com/chat" class="button">View Message</a>
            </div>

            <div class="content">
                <p>Don't keep them waiting - respond to ${senderName} now!</p>
            </div>

            <div class="footer">
                <p>You're receiving this email because someone sent you a message on Launchpad.</p>
                <div class="unsubscribe">
                    <a href="${unsubscribeLink}">Unsubscribe from message notifications</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
