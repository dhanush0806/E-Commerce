const db = require('../config/db');
const { apiResponse } = require('../utils/response');
const { formatOrder } = require('./order.controller');
const crypto = require('crypto');

const simulatePayment = async (req, res, next) => {
  try {
    const { orderNumber, success = true } = req.body;

    if (!orderNumber) {
      return apiResponse(res, 400, false, 'Order number is required');
    }

    const [orderRows] = await db.query('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (orderRows.length === 0) {
      return apiResponse(res, 404, false, `Order not found: ${orderNumber}`);
    }
    const order = orderRows[0];

    const transactionId = `PG-NEX-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const status = success ? 'SUCCESS' : 'FAILED';
    const failureReason = success ? null : 'Transaction declined by bank';

    await db.query(
      `INSERT INTO payment_attempts (order_id, amount, payment_method, transaction_id, status, failure_reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order.id, order.total_amount, order.payment_method, transactionId, status, failureReason]
    );

    const newPaymentStatus = success ? 'PAID' : 'FAILED';
    const newOrderStatus = success ? 'PROCESSING' : order.status;

    await db.query(
      'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
      [newPaymentStatus, newOrderStatus, order.id]
    );

    const [updatedOrderRows] = await db.query(
      `SELECT o.*, u.email, u.first_name, u.last_name,
              a.full_name AS address_full_name, a.phone AS address_phone, a.street_address, a.city, a.state, a.postal_code
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.id = ?`,
      [order.id]
    );

    const [itemRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    return apiResponse(res, 200, true, 'Payment processed successfully', formatOrder(updatedOrderRows[0], itemRows));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  simulatePayment,
};
