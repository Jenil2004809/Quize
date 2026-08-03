const nodemailer = require('nodemailer');

// Generate 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create email transporter supporting Gmail and standard SMTP
const getTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return null;
};

// Send OTP Email via Nodemailer
const sendOTPEmail = async (email, otp, purpose = 'login') => {
  const transporter = getTransporter();
  const title = purpose === 'reset' ? 'Reset Your Password' : 'Verify Your Email Address';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #3b82f6; text-align: center;">Quizzy Online Quiz Platform</h2>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p>Hello,</p>
      <p>Thank you for using Quizzy. Use the OTP code below to proceed with your ${purpose === 'reset' ? 'password reset' : 'account verification'}:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a; background-color: #eff6ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #3b82f6;">${otp}</span>
      </div>
      <p style="color: #666; font-size: 14px;">This OTP code is valid for 5 minutes. Do not share this code with anyone.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px; text-align: center;">Quizzy Inc. | All rights reserved</p>
    </div>
  `;

  if (!transporter) {
    console.warn(`[SMTP NOTICE] No SMTP / Gmail credentials found in backend/.env. OTP for ${email} is ${otp}`);
    return false;
  }

  try {
    const fromEmail = process.env.GMAIL_USER || process.env.FROM_EMAIL || process.env.SMTP_USER || '"Quizzy Platform" <noreply@quizsystem.com>';
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: `[Quizzy] ${title}`,
      text: `Your Quizzy OTP code is: ${otp}. It is valid for 5 minutes.`,
      html: html
    });
    console.log(`[EMAIL SUCCESS] Real OTP email sent via Nodemailer to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending real email via Nodemailer:', error.message);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};
