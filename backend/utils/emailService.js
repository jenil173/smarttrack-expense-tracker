const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, attachments }) => {
    try {
        // Create reusable transporter normally using SMTP. 
        // For project demonstration without real credentials, using Ethereal or standard mock logging
        // We will try standard gmail but fallback to logging if credentials are missing.

        if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email') || !process.env.EMAIL_PASS || process.env.EMAIL_PASS.includes('your-app-password')) {
            console.warn("⚠️ EMAIL ERROR: Placeholder credentials detected in .env. Please set up a Gmail App Password.");
            return false;
        }

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log(`[EMAIL] Attempting to send email to: ${to} (Subject: ${subject})`);
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"SmartTrack" <${process.env.EMAIL_USER || 'no-reply@smarttrack.com'}>`,
            to,
            subject,
            html,
            attachments
        });

        console.log(`[SUCCESS] Email sent successfully: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[ERROR] Email Delivery Failed to ${to}:`, error.message);
        if (error.code === 'EAUTH') {
            console.error('[ERROR] Gmail Authentication Failed. Please check if EMAIL_PASS is a valid App Password.');
        }
        return false;
    }

};

module.exports = sendEmail;
