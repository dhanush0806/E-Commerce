const db = require('../config/db');
const { apiResponse, pageResponse } = require('../utils/response');

const formatOrder = (orderRow, itemsRows = []) => {
  const addressText = orderRow.shipping_address_text || (
    orderRow.address_full_name
      ? `${orderRow.address_full_name}, ${orderRow.street_address}, ${orderRow.city}, ${orderRow.state} - ${orderRow.postal_code} (Ph: ${orderRow.address_phone})`
      : 'Standard Ground Address'
  );

  return {
    id: orderRow.id,
    orderNumber: orderRow.order_number,
    userId: orderRow.user_id,
    customerName: orderRow.customer_name || `${orderRow.first_name || ''} ${orderRow.last_name || ''}`.trim(),
    customerEmail: orderRow.customer_email || orderRow.email,
    shippingAddressText: addressText,
    subtotal: Number(orderRow.subtotal),
    tax: Number(orderRow.tax),
    shippingFee: Number(orderRow.shipping_fee),
    totalAmount: Number(orderRow.total_amount),
    status: orderRow.status,
    paymentStatus: orderRow.payment_status,
    paymentMethod: orderRow.payment_method,
    estimatedDelivery: orderRow.estimated_delivery,
    items: itemsRows.map((it) => ({
      id: it.id,
      productId: it.product_id,
      productName: it.product_name,
      productSku: it.product_sku,
      productImageUrl: it.product_image_url,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unit_price),
      totalPrice: Number(it.total_price),
    })),
    createdAt: orderRow.created_at,
  };
};

const createOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { addressId, paymentMethod = 'Credit Card' } = req.body;

    if (!addressId) {
      await connection.rollback();
      connection.release();
      return apiResponse(res, 400, false, 'Shipping address ID is required');
    }

    // Verify address belongs to user
    const [addressRows] = await connection.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, req.user.id]
    );

    if (addressRows.length === 0) {
      await connection.rollback();
      connection.release();
      return apiResponse(res, 404, false, 'Shipping address not found');
    }
    const address = addressRows[0];

    // Find cart
    const [cartRows] = await connection.query('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (cartRows.length === 0) {
      await connection.rollback();
      connection.release();
      return apiResponse(res, 400, false, 'Cart is empty');
    }
    const cartId = cartRows[0].id;

    // Fetch cart items
    const [cartItems] = await connection.query(
      `SELECT ci.*, p.name, p.sku, p.image_url, p.price, p.stock_quantity, p.is_active
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?
       FOR UPDATE`,
      [cartId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      connection.release();
      return apiResponse(res, 400, false, 'Cannot create order from an empty cart');
    }

    let subtotal = 0;
    const itemsToInsert = [];

    for (const item of cartItems) {
      if (!item.is_active) {
        await connection.rollback();
        connection.release();
        return apiResponse(res, 400, false, `Product "${item.name}" is no longer available`);
      }

      if (item.stock_quantity < item.quantity) {
        await connection.rollback();
        connection.release();
        return apiResponse(res, 400, false, `Insufficient stock for "${item.name}". Only ${item.stock_quantity} available.`);
      }

      // Decrement stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );

      const itemTotal = Number((item.price * item.quantity).toFixed(2));
      subtotal += itemTotal;

      itemsToInsert.push({
        productId: item.product_id,
        name: item.name,
        sku: item.sku,
        imageUrl: item.image_url,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        totalPrice: itemTotal,
      });
    }

    const subtotalFixed = Number(subtotal.toFixed(2));
    const tax = Number((subtotalFixed * 0.05).toFixed(2));
    const shippingFee = subtotalFixed >= 499 ? 0.00 : 99.00;
    const totalAmount = Number((subtotalFixed + tax + shippingFee).toFixed(2));

    const orderNumber = `404-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    const estimatedDelivery = deliveryDate.toISOString().slice(0, 10);

    const [orderInsertResult] = await connection.query(
      `INSERT INTO orders 
        (order_number, user_id, shipping_address_id, subtotal, tax, shipping_fee, total_amount, status, payment_status, payment_method, estimated_delivery)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', 'PAID', ?, ?)`,
      [
        orderNumber,
        req.user.id,
        address.id,
        subtotalFixed,
        tax,
        shippingFee,
        totalAmount,
        paymentMethod,
        estimatedDelivery,
      ]
    );

    const orderId = orderInsertResult.insertId;

    for (const it of itemsToInsert) {
      await connection.query(
        `INSERT INTO order_items 
          (order_id, product_id, product_name, product_sku, product_image_url, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, it.productId, it.name, it.sku, it.imageUrl, it.quantity, it.unitPrice, it.totalPrice]
      );
    }

    // Clear cart
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();
    connection.release();

    // Fetch order to return
    const [orderRows] = await db.query(
      `SELECT o.*, u.email, u.first_name, u.last_name,
              a.full_name AS address_full_name, a.phone AS address_phone, a.street_address, a.city, a.state, a.postal_code
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.id = ?`,
      [orderId]
    );

    const [orderItemsRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    const formattedOrder = formatOrder(orderRows[0], orderItemsRows);
    return apiResponse(res, 201, true, 'Order created successfully', formattedOrder);
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const page = Math.max(0, parseInt(req.query.page || '0', 10));
    const size = Math.max(1, parseInt(req.query.size || '10', 10));
    const offset = page * size;

    const [countResult] = await db.query('SELECT COUNT(*) AS total FROM orders WHERE user_id = ?', [req.user.id]);
    const totalElements = countResult[0].total;

    const [orderRows] = await db.query(
      `SELECT o.*, u.email, u.first_name, u.last_name,
              a.full_name AS address_full_name, a.phone AS address_phone, a.street_address, a.city, a.state, a.postal_code
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, size, offset]
    );

    const formattedList = [];
    for (const ord of orderRows) {
      const [itemRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
      formattedList.push(formatOrder(ord, itemRows));
    }

    return apiResponse(res, 200, true, 'User orders retrieved successfully', pageResponse(formattedList, page, size, totalElements));
  } catch (error) {
    next(error);
  }
};

const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const [orderRows] = await db.query(
      `SELECT o.*, u.email, u.first_name, u.last_name,
              a.full_name AS address_full_name, a.phone AS address_phone, a.street_address, a.city, a.state, a.postal_code
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.order_number = ? AND o.user_id = ?`,
      [orderNumber, req.user.id]
    );

    if (orderRows.length === 0) {
      return apiResponse(res, 404, false, `Order not found with order number: ${orderNumber}`);
    }

    const [itemRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderRows[0].id]);

    return apiResponse(res, 200, true, 'Order retrieved successfully', formatOrder(orderRows[0], itemRows));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  formatOrder,
  createOrder,
  getUserOrders,
  getOrderByNumber,
};
