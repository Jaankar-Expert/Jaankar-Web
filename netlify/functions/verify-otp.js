const crypto = require('crypto');

const SECRET = 'JAANKAR_SUPER_SECURE_AUTH_SECRET_2026';

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
    const inputOtp = (payload.otp || '').trim();
    const token = (payload.token || '').trim();

    if (!email || !inputOtp || !token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Email, OTP, and session token are required.' })
      };
    }

    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid session token format.' })
      };
    }

    const { email: tokenEmail, expiresAt, hash } = tokenData;

    if (tokenEmail !== email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Email does not match verification session.' })
      };
    }

    if (Date.now() > expiresAt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'OTP has expired. Please request a new code.' })
      };
    }

    const expectedHash = crypto.createHmac('sha256', SECRET).update(`${email}:${inputOtp}:${expiresAt}`).digest('hex');

    if (expectedHash !== hash) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Incorrect OTP. Please check your email and try again.' })
      };
    }

    const displayName = email.split('@')[0];
    const user = {
      email: email,
      displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      lastLogin: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Login successful!',
        user: user
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message || 'Verification failed.' })
    };
  }
};
