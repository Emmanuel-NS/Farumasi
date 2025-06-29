const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { getToken } = require('../utils/momo');
require('dotenv').config();

const {
  MOMO_BASE_URL,
  MOMO_SUBSCRIPTION_KEY,
  MOMO_TARGET_ENV
} = process.env;

// Initiate payment
exports.requestToPay = async (req, res) => {
  const { order_id, amount, payer, currency } = req.body;
  const referenceId = uuidv4();
  const finalCurrency = currency || 'RWF';

  if (!order_id || !amount || !payer) {
    return res.status(400).json({ error: 'Missing required fields: order_id, amount, payer' });
  }

  const token = await getToken();
  if (!token) return res.status(500).json({ error: 'Unable to get MoMo access token' });

  try {
    await axios.post(`${MOMO_BASE_URL}/collection/v1_0/requesttopay`, {
      amount,
      currency: finalCurrency,
      externalId: order_id.toString(),
      payer: {
        partyIdType: "MSISDN",
        partyId: payer
      },
      payerMessage: "Order payment",
      payeeNote: "FARUMASI"
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': MOMO_TARGET_ENV,
        'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
      }
    });

    db.run(`
      INSERT INTO payments (order_id, reference_id, amount, payer, currency, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')
    `, [order_id, referenceId, amount, payer, finalCurrency]);

    res.json({ message: 'Payment initiated', referenceId });

  } catch (err) {
    console.error('MoMo error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

// Check payment status
exports.checkStatus = async (req, res) => {
  const { referenceId } = req.params;

  const token = await getToken();
  if (!token) return res.status(500).json({ error: 'Unable to get MoMo access token' });

  try {
    const response = await axios.get(`${MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Target-Environment': MOMO_TARGET_ENV,
        'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY
      }
    });

    const status = response.data.status;
    db.run(`UPDATE payments SET status = ? WHERE reference_id = ?`, [status, referenceId]);

    res.json({ status });
  } catch (err) {
    console.error('Check MoMo status error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
};
