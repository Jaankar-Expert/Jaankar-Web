const tls = require('tls');
const crypto = require('crypto');

const GMAIL_USER = 'expertshiba@gmail.com';
const GMAIL_APP_PASS = 'rdznesndrjuatjaf';
const SECRET = 'JAANKAR_SUPER_SECURE_AUTH_SECRET_2026';

function generateModernHtmlTemplate(otp) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JAANKAR Verification Code</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);">
    
    <!-- Top Brand Accent Bar -->
    <div style="height: 5px; background: linear-gradient(90deg, #FF5000, #FF7A00);"></div>

    <div style="padding: 32px 28px 24px 28px;">
      
      <!-- Logo Header -->
      <div style="margin-bottom: 24px;">
        <span style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #0F172A;">JAAN</span><span style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FF5722;">KAR</span>
        <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px;">
          Smart Tech Knowledge & Tools
        </div>
      </div>

      <!-- Main Heading -->
      <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 10px 0; line-height: 1.3;">
        Verify your email address
      </h1>

      <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
        Please enter the 6-digit verification code below to verify your account and continue:
      </p>

      <!-- OTP Display Box -->
      <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 12px; padding: 24px 16px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 700; color: #9A3412; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">
          One-Time Verification Code
        </div>
        <div style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #FF5722; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace; margin: 6px 0;">
          ${otp}
        </div>
        <div style="display: inline-block; font-size: 12px; font-weight: 600; color: #C2410C; background-color: #FFEDD5; padding: 4px 12px; border-radius: 20px; margin-top: 6px;">
          ⏱ Valid for 10 minutes
        </div>
      </div>

      <!-- Security Notice -->
      <div style="background-color: #F8FAFC; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px; border: 1px solid #F1F5F9;">
        <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5;">
          🔒 <strong>Security Notice:</strong> Never share this code with anyone. JAANKAR team members will never ask for your verification code.
        </p>
      </div>

      <!-- Didn't request notice -->
      <p style="font-size: 12px; color: #64748B; margin: 0; line-height: 1.5;">
        Didn't request this code? You can safely ignore this email or contact us at <a href="mailto:JaankarExpert@outlook.com" style="color: #FF5722; text-decoration: none; font-weight: 600;">JaankarExpert@outlook.com</a>.
      </p>

    </div>

    <!-- Clean Minimal Footer -->
    <div style="padding: 16px 28px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; font-size: 11px; color: #94A3B8; text-align: center;">
      © 2026 JAANKAR Official. All rights reserved.
    </div>

  </div>
</body>
</html>`;
}

function sendGmailSmtpEmail(toEmail, otp) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, 'smtp.gmail.com', () => {});

    let step = 0;
    const authString = Buffer.from(`\0${GMAIL_USER}\0${GMAIL_APP_PASS}`).toString('base64');
    const htmlContent = generateModernHtmlTemplate(otp);

    const rawMessage = [
      `From: "JAANKAR Official" <${GMAIL_USER}>`,
      `To: ${toEmail}`,
      `Subject: ${otp} is your JAANKAR verification code`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      htmlContent,
      `.`
    ].join('\r\n');

    socket.on('data', (data) => {
      const response = data.toString();
      const code = parseInt(response.substring(0, 3));

      if (step === 0 && code === 220) {
        socket.write('EHLO jaankar.app\r\n');
        step = 1;
      } else if (step === 1 && code === 250) {
        socket.write('AUTH PLAIN ' + authString + '\r\n');
        step = 2;
      } else if (step === 2 && code === 235) {
        socket.write(`MAIL FROM:<${GMAIL_USER}>\r\n`);
        step = 3;
      } else if (step === 3 && code === 250) {
        socket.write(`RCPT TO:<${toEmail}>\r\n`);
        step = 4;
      } else if (step === 4 && code === 250) {
        socket.write('DATA\r\n');
        step = 5;
      } else if (step === 5 && code === 354) {
        socket.write(rawMessage + '\r\n');
        step = 6;
      } else if (step === 6 && code === 250) {
        socket.write('QUIT\r\n');
        resolve({ success: true, message: 'Modern template OTP sent via Gmail SMTP!' });
      } else if (code >= 400) {
        socket.end();
        reject(new Error(`SMTP Error ${code}: ${response}`));
      }
    });

    socket.on('error', (err) => reject(err));
  });
}

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
    };
  }

  try {
    let payload = {};
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (_) {}

    const email = (payload.email || '').toLowerCase().trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Valid email address required.' })
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const hash = crypto.createHmac('sha256', SECRET).update(`${email}:${otp}:${expiresAt}`).digest('hex');
    const token = Buffer.from(JSON.stringify({ email, expiresAt, hash })).toString('base64');

    await sendGmailSmtpEmail(email, otp);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Verification code sent to ' + email,
        token: token,
        expiresAt: expiresAt
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: err.message || 'Failed to send verification code.'
      })
    };
  }
};
