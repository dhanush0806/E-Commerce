const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/simulate', paymentController.simulatePayment);

module.exports = router;
