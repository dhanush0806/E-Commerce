const db = require('../config/db');
const { apiResponse } = require('../utils/response');

const getOrCreateCart = async (userId) => {
  const [rows] = await db.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return result.insertId;
};

const getCartDetails = async (cartId) => {
  const [items] = await db.query(
    `SELECT 
      ci.id,
      ci.quantity,
      p.id AS productId,
      p.name AS productName,
      p.sku AS productSku,
      p.image_url AS imageUrl,
      p.price AS unitPrice,
      p.stock_quantity AS stockQuantity,
      p.is_active AS isActive
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = ?
    ORDER BY ci.id ASC`,
    [cartId]
  );

  let grandTotal = 0;
  let totalItems = 0;

  const formattedItems = items.map((item) => {
    const unitPrice = Number(item.unitPrice);
    const qty = Number(item.quantity);
    const subtotal = Number((unitPrice * qty).toFixed(2));
    grandTotal += subtotal;
    totalItems += qty;

    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      imageUrl: item.imageUrl,
      unitPrice,
      quantity: qty,
      subtotal,
    };
  });

  return {
    id: cartId,
    items: formattedItems,
    grandTotal: Number(grandTotal.toFixed(2)),
    totalItems,
  };
};

const getCart = async (req, res, next) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);
    const cart = await getCartDetails(cartId);
    return apiResponse(res, 200, true, 'Cart retrieved successfully', cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return apiResponse(res, 400, false, 'Product ID is required');
    }
    const requestedQty = Math.max(1, parseInt(quantity, 10));

    const [productRows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (productRows.length === 0) {
      return apiResponse(res, 404, false, 'Product not found');
    }
    const product = productRows[0];

    if (!product.is_active) {
      return apiResponse(res, 400, false, 'Product is not available for purchase');
    }

    if (product.stock_quantity < requestedQty) {
      return apiResponse(res, 400, false, `Only ${product.stock_quantity} items available in stock`);
    }

    const cartId = await getOrCreateCart(req.user.id);

    const [existingItemRows] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    if (existingItemRows.length > 0) {
      const newQty = existingItemRows[0].quantity + requestedQty;
      if (product.stock_quantity < newQty) {
        return apiResponse(res, 400, false, `Cannot add more. Available stock: ${product.stock_quantity}`);
      }
      await db.query('UPDATE cart_items SET quantity = ?, unit_price = ? WHERE id = ?', [
        newQty,
        product.price,
        existingItemRows[0].id,
      ]);
    } else {
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [cartId, productId, requestedQty, product.price]
      );
    }

    const cart = await getCartDetails(cartId);
    return apiResponse(res, 200, true, 'Item added to cart', cart);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity == null || quantity < 1) {
      return apiResponse(res, 400, false, 'Quantity must be at least 1');
    }

    const cartId = await getOrCreateCart(req.user.id);

    const [itemRows] = await db.query(
      `SELECT ci.*, p.stock_quantity, p.name 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.id = ? AND ci.cart_id = ?`,
      [id, cartId]
    );

    if (itemRows.length === 0) {
      return apiResponse(res, 404, false, 'Cart item not found');
    }

    const item = itemRows[0];
    if (item.stock_quantity < quantity) {
      return apiResponse(res, 400, false, `Only ${item.stock_quantity} available in stock`);
    }

    await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id]);

    const cart = await getCartDetails(cartId);
    return apiResponse(res, 200, true, 'Cart item updated', cart);
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cartId = await getOrCreateCart(req.user.id);

    await db.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [id, cartId]);

    const cart = await getCartDetails(cartId);
    return apiResponse(res, 200, true, 'Cart item removed', cart);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateCart,
  getCartDetails,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
