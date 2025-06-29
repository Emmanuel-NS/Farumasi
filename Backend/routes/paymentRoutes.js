const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/pay', paymentController.requestToPay);
router.get('/status/:referenceId', paymentController.checkStatus);

module.exports = router;
