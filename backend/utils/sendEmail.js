const nodemailer = require('nodemailer');

/**
 * Universal Production-Ready Email Delivery Helper
 * @param {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
  try {
    let transporter;

    // Check if SMTP environment variables exist in .env
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_EMAIL || process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      // Use configured production SMTP (Gmail App Password, SendGrid, Mailgun, etc.)
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    } else {
      // Development Fallback: Create Ethereal Test Account automatically for real preview links
      console.log('⚠️ No SMTP credentials found in .env. Creating Ethereal Test Email account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || `"Quiz System Support" <${smtpUser || 'noreply@quizsystem.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<div style="font-family: Arial, sans-serif; padding: 20px;">${options.message}</div>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${options.email}. Message ID: ${info.messageId}`);

    // If Ethereal test email was used, print the preview URL in console
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal Email Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ Error sending email via Nodemailer:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
