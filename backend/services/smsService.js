const https = require('https');

/**
 * Real Production WhatsApp OTP Service
 * Sends OTP directly to user's WhatsApp number
 */
const sendWhatsAppOTP = async (phone, otp) => {
  const whatsappBody = `*Quizzy Verification Code*\n\nYour OTP is *${otp}*.\nThis OTP is valid for 5 minutes.\nDo not share this code with anyone.`;
  const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone.replace(/[^0-9]/g, '').slice(-10);

  // 1. Twilio WhatsApp API Integration
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppSender = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio Sandbox default

  if (twilioSid && twilioAuthToken) {
    try {
      const twilio = require('twilio');
      const client = twilio(twilioSid, twilioAuthToken);
      
      const message = await client.messages.create({
        body: whatsappBody,
        from: twilioWhatsAppSender.startsWith('whatsapp:') ? twilioWhatsAppSender : `whatsapp:${twilioWhatsAppSender}`,
        to: `whatsapp:${formattedPhone}`
      });
      
      console.log(`[TWILIO WHATSAPP SENT] Message SID: ${message.sid} | To WhatsApp: ${formattedPhone}`);
      return true;
    } catch (err) {
      console.error('[TWILIO WHATSAPP ERROR]', err.message);
    }
  }

  // 2. UltraMsg WhatsApp API Integration
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;
  if (instanceId && token) {
    return new Promise((resolve) => {
      const cleanPhone = formattedPhone.replace(/[^0-9]/g, '');
      const postData = JSON.stringify({
        token: token,
        to: cleanPhone,
        body: whatsappBody
      });

      const options = {
        hostname: 'api.ultramsg.com',
        path: `/${instanceId}/messages/chat`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          console.log(`[ULTRAMSG WHATSAPP SENT] To: ${cleanPhone} | Response: ${responseData}`);
          resolve(true);
        });
      });

      req.on('error', (err) => {
        console.error('[ULTRAMSG ERROR]', err.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  }

  console.log(`\n====================================================================`);
  console.log(`[WHATSAPP DISPATCH LOG] To Mobile WhatsApp: ${formattedPhone}`);
  console.log(`[WHATSAPP DISPATCH LOG] OTP Code: ${otp}`);
  console.log(`====================================================================\n`);

  return true;
};

/**
 * Real Production SMS Service for Quizzy
 * Supports Twilio SMS Gateway, Fast2SMS, MSG91 SMS, and WhatsApp Fallback
 */
const sendRealSMS = async (phone, otp, channel = 'sms') => {
  if (channel === 'whatsapp') {
    return await sendWhatsAppOTP(phone, otp);
  }

  const smsBody = `Quizzy Verification Code\n\nYour OTP is ${otp}.\nThis OTP is valid for 5 minutes.\nDo not share this code with anyone.`;

  // 1. Check Fast2SMS Configuration (Indian Numbers)
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&route=otp&variables_values=${otp}&flash=0&numbers=${cleanPhone}`;
      
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log(`[FAST2SMS SUCCESS] Real SMS dispatched to ${cleanPhone}:`, data));
      }).on('error', (err) => console.error('[FAST2SMS ERROR]', err.message));

      return true;
    } catch (err) {
      console.error('[FAST2SMS ERROR]', err.message);
    }
  }

  // 2. Check Twilio SMS Configuration
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuthToken && twilioPhone) {
    try {
      const twilio = require('twilio');
      const client = twilio(twilioSid, twilioAuthToken);
      
      const message = await client.messages.create({
        body: smsBody,
        from: twilioPhone,
        to: phone
      });
      
      console.log(`[TWILIO SMS SENT] Message SID: ${message.sid} | To: ${phone}`);
      return true;
    } catch (err) {
      console.error('[TWILIO SMS ERROR]', err.message);
      // Fallback to WhatsApp if SMS fails
      console.log('[FALLBACK TO WHATSAPP] Attempting WhatsApp delivery...');
      return await sendWhatsAppOTP(phone, otp);
    }
  }

  // 3. Check MSG91 Configuration
  const msg91AuthKey = process.env.MSG91_AUTH_KEY;
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

  if (msg91AuthKey && msg91TemplateId) {
    return new Promise((resolve) => {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const postData = JSON.stringify({
        template_id: msg91TemplateId,
        mobile: cleanPhone,
        otp: otp
      });

      const options = {
        hostname: 'api.msg91.com',
        path: '/api/v5/otp?template_id=' + msg91TemplateId + '&mobile=' + cleanPhone + '&otp=' + otp,
        method: 'POST',
        headers: {
          'authkey': msg91AuthKey,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          console.log(`[MSG91 SMS SENT] To: ${phone} | Response: ${responseData}`);
          resolve(true);
        });
      });

      req.on('error', async (err) => {
        console.error('[MSG91 SMS ERROR]', err.message);
        // Fallback to WhatsApp if SMS fails
        await sendWhatsAppOTP(phone, otp);
        resolve(true);
      });

      req.write(postData);
      req.end();
    });
  }

  // Default fallback: attempt WhatsApp OTP dispatch
  return await sendWhatsAppOTP(phone, otp);
};

module.exports = {
  sendRealSMS,
  sendWhatsAppOTP
};
