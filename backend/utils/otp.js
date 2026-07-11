const nodemailer = require('nodemailer');

// Generate 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create email transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 2525;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Return null if credentials are not configured, fallback to console logging
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === '465', // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });
};

// Send OTP Email
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const transporter = getTransporter();
  const title = purpose === 'reset' ? 'Reset Your Password' : 'Verify Your Email Address';
  const text = purpose === 'reset'
    ? `Your password reset OTP code is: ${otp}. It is valid for 10 minutes.`
    : `Your email verification OTP code is: ${otp}. It is valid for 10 minutes.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #3b82f6; text-align: center;">Quizzy Online Quiz Platform</h2>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p>Hello,</p>
      <p>Thank you for choosing Quizzy. Use the OTP code below to proceed with your ${purpose === 'reset' ? 'password reset' : 'account verification'}:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a; background-color: #eff6ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #3b82f6;">${otp}</span>
      </div>
      <p style="color: #666; font-size: 14px;">This OTP code is valid for 10 minutes. Please do not share this code with anyone.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px; text-align: center;">Quizzy Inc. | All rights reserved</p>
    </div>
  `;

  if (!transporter) {
    console.log(`\n==============================================`);
    console.log(`[MAIL MOCK] Sending OTP to: ${email}`);
    console.log(`[MAIL MOCK] Purpose: ${purpose}`);
    console.log(`[MAIL MOCK] OTP CODE: ${otp}`);
    console.log(`==============================================\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"Quizzy Platform" <noreply@quizsystem.com>',
      to: email,
      subject: `[Quizzy] ${title}`,
      text: text,
      html: html
    });
    return true;
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
    // Fall back to logging to console so the application remains functional even if mail server fails
    console.log(`\n============================ FALLBACK ============================`);
    console.log(`[MAIL FALLBACK] SMTP failed, logging OTP. To: ${email}`);
    console.log(`[MAIL FALLBACK] OTP CODE: ${otp}`);
    console.log(`==================================================================\n`);
    return true;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};
