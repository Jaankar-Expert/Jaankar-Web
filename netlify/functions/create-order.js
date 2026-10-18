require('dotenv').config();
const Razorpay = require('razorpay');

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

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Razorpay API credentials missing in environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET).'
      })
    };
  }

  try {
    let payload = {};
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (_) {}

    // Amount in paise
    let amount = parseInt(payload.amount, 10);
    if (isNaN(amount) || amount < 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid amount. Minimum transaction amount is 100 paise (₹1.00).'
        })
      };
    }

    const currency = payload.currency || 'INR';
    const receipt = payload.receipt || `rcpt_${Date.now()}`;

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    const orderOptions = {
      amount: amount,
      currency: currency,
      receipt: String(receipt).slice(0, 40),
      notes: payload.notes || {}
    };

    const order = await razorpay.orders.create(orderOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      })
    };
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    const statusCode = (err.statusCode && err.statusCode === 401) ? 401 : 500;
    return {
      statusCode: statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        error: err.error?.description || err.message || 'Failed to create Razorpay order'
      })
    };
  }
};
