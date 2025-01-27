const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fetchData = require('../utils/fetchUtils');
const phonepeConfig = require('../config/phonepeConfig');

// Initiate Payment
const createOrder = async (req, res) => {
  const { name, mobileNumber, amount } = req.body;
  const orderId = uuidv4();

  // Payment Payload
  const paymentPayload = {
    merchantId: phonepeConfig.MERCHANT_ID,
    merchantUserId: name,
    mobileNumber: mobileNumber,
    amount: amount * 100, // Amount in paise
    merchantTransactionId: orderId,
    redirectUrl: `${phonepeConfig.REDIRECT_URL}/?id=${orderId}`,
    redirectMode: 'POST',
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  // Convert payload to base64
  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

  // Generate checksum
  const keyIndex = 1;
  const string = payload + '/pg/v1/pay' + phonepeConfig.MERCHANT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + keyIndex;

  // Fetch API options
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
    },
    body: JSON.stringify({ request: payload }),
  };

  try {
    const response = await fetchData(`${phonepeConfig.MERCHANT_BASE_URL}/pg/v1/pay`, options);
    console.log(response.data.instrumentResponse.redirectInfo.url);
    res.status(200).json({ msg: "OK", url: response.data.instrumentResponse.redirectInfo.url });
  } catch (error) {
    console.error('Error in payment:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};
// Check Payment Status
const checkStatus = async (req, res) => {
  const merchantTransactionId = req.query.id;

  // Generate checksum
  const keyIndex = 1;
  const endpoint = `/pg/v1/status/${phonepeConfig.MERCHANT_ID}/${merchantTransactionId}`;
  const string = endpoint + phonepeConfig.MERCHANT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + keyIndex;

  // Fetch API options
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': phonepeConfig.MERCHANT_ID,
    },
  };

  try {
    const url = `${phonepeConfig.MERCHANT_BASE_URL}${endpoint}`;
    const response = await fetch(url, options);
    const data = await response.json();
    console.log("CHECK STATUS RESPONSE: ", data);
    if (data.success) {
      return res.redirect(phonepeConfig.SUCCESS_URL);
    } else {
      return res.redirect(phonepeConfig.FAILURE_URL);
    }
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return res.redirect(phonepeConfig.FAILURE_URL);
  }
};


module.exports = { createOrder, checkStatus };