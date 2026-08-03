const https = require('https');

const sendTextbeltSMS = (phone, otp) => {
  const postData = JSON.stringify({
    phone: phone.startsWith('+') ? phone : '+91' + phone.replace(/[^0-9]/g, ''),
    message: `Quizzy Verification Code: Your OTP is ${otp}. Valid for 5 minutes.`,
    key: 'textbelt'
  });

  const options = {
    hostname: 'textbelt.com',
    port: 443,
    path: '/text',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => console.log('TEXTBELT API RESPONSE:', responseData));
  });

  req.on('error', (e) => console.error('TEXTBELT ERROR:', e));
  req.write(postData);
  req.end();
};

sendTextbeltSMS('9016466277', '482951');
