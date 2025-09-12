/**
 * General Email Templates for Launchpad
 * Contains reusable email templates for various system communications
 */

export const graduationEmailTemplate = (userName, schoolName, migrationLink) => {
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

export const migrationReminderEmailTemplate = (userName, schoolName, migrationLink) => {
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

export const migrationSuccessEmailTemplate = (userName, schoolName) => {
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
