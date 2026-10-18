require('dotenv').config();
const crypto = require('crypto');

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

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Razorpay Key Secret is missing in environment variables (RAZORPAY_KEY_SECRET).'
      })
    };
  }

  try {
    let payload = {};
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (_) {}

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

    // Validate presence of all three fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required payment verification fields (razorpay_order_id, razorpay_payment_id, razorpay_signature).'
        })
      };
    }

    // Expected signature generation: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Secure timing-safe comparison
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(razorpay_signature, 'utf8');

    const isMatch = (expectedBuf.length === receivedBuf.length) && crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isMatch) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          verified: false,
          error: 'Payment verification failed: Signature mismatch. Transaction cannot be validated.'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        verified: true,
        message: 'Payment signature verified successfully.',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      })
    };
  } catch (err) {
    console.error('Razorpay signature verification error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        verified: false,
        error: err.message || 'Internal server error while verifying payment signature.'
      })
    };
  }
};
