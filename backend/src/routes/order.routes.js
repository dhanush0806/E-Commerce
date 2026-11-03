const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:orderNumber', orderController.getOrderByNumber);

module.exports = router;
