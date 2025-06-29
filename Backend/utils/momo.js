require('dotenv').config();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const {
  MOMO_API_USER,
  MOMO_API_KEY,
  MOMO_SUBSCRIPTION_KEY,
  MOMO_TARGET_ENV,
  MOMO_BASE_URL
} = process.env;

exports.getToken = async () => {
  const auth = Buffer.from(`${MOMO_API_USER}:${MOMO_API_KEY}`).toString('base64');

  const res = await axios.post(`${MOMO_BASE_URL}/collection/token/`, null, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY
    }
  });

  return res.data.access_token;
};
