const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, attachments }) => {
    try {
        // Create reusable transporter normally using SMTP. 
        // For project demonstration without real credentials, using Ethereal or standard mock logging
        // We will try standard gmail but fallback to logging if credentials are missing.

        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '') : '';

        if (!emailUser || emailUser.includes('your-email') || !emailPass || emailPass.includes('your-app-password')) {
            console.warn("⚠️ EMAIL ERROR: Placeholder or missing credentials detected in .env. Please set up a Gmail App Password.");
            return false;
        }

        // Using explicit host and port is more reliable than 'service: gmail' in many environments
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use TLS
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        console.log(`[EMAIL] Attempting to send email to: ${to} (Subject: ${subject})`);
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"SmartTrack" <${emailUser}>`,
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
            console.error('[ERROR] Gmail Authentication Failed. This usually means the App Password is invalid or revoked.');
        } else if (error.code === 'ESOCKET') {
            console.error('[ERROR] Connection blocked. Ensure port 465 is open in your environment.');
        }
        return false;
    }

};

module.exports = sendEmail;
