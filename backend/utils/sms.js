const https = require('https');

// SMS Service Utility for Mobile OTP verification
const sendSMSOTP = async (phone, otp) => {
  console.log(`\n==============================================`);
  console.log(`[MOBILE SMS DISPATCH] To Mobile Number: ${phone}`);
  console.log(`[MOBILE SMS DISPATCH] OTP Code: ${otp}`);
  console.log(`[MOBILE SMS DISPATCH] Message: Your Quizzy verification OTP code is ${otp}. Valid for 5 minutes.`);
  console.log(`==============================================\n`);

  // 1. Support for Fast2SMS Gateway (Indian Mobile Numbers)
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10); // get 10-digit number
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&route=otp&variables_values=${otp}&flash=0&numbers=${cleanPhone}`;
      
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log(`[FAST2SMS SUCCESS] SMS dispatched to ${cleanPhone}:`, data));
      }).on('error', (err) => console.error('Fast2SMS request error:', err.message));

      return true;
    } catch (err) {
      console.error('Fast2SMS error:', err.message);
    }
  }

  // 2. Support for Twilio SMS Gateway
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = require('twilio')(accountSid, authToken);
      await client.messages.create({
        body: `Your Quizzy verification OTP code is ${otp}. Valid for 5 minutes.`,
        from: twilioPhone,
        to: phone
      });
      console.log(`[TWILIO SMS SUCCESS] Delivered SMS to ${phone}`);
      return true;
    } catch (err) {
      console.error('Twilio SMS error:', err.message);
    }
  }

  return true;
};

module.exports = {
  sendSMSOTP
};
