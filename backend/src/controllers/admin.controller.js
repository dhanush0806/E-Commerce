const db = require('../config/db');
const { apiResponse, pageResponse } = require('../utils/response');
const { formatProduct } = require('./product.controller');
const { formatCategory } = require('./category.controller');
const { formatOrder } = require('./order.controller');

const getDashboardStats = async (req, res, next) => {
  try {
    const [revResult] = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE payment_status = 'PAID'"
    );
    const [ordersResult] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [productsResult] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [outOfStockResult] = await db.query('SELECT COUNT(*) AS outOfStockProducts FROM products WHERE stock_quantity <= 0');
    const [usersResult] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');

    const stats = {
      totalRevenue: Number(revResult[0].totalRevenue),
      totalOrders: Number(ordersResult[0].totalOrders),
      totalProducts: Number(productsResult[0].totalProducts),
      outOfStockProducts: Number(outOfStockResult[0].outOfStockProducts),
      totalUsers: Number(usersResult[0].totalUsers),
    };

    return apiResponse(res, 200, true, 'Admin stats retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description = '',
      price,
      originalPrice,
      stockQuantity = 0,
      sku,
      imageUrl,
      categoryId,
      rating = 4.5,
      reviewCount = 120,
      isBestSeller = false,
      isActive = true,
    } = req.body;

    if (!name || price == null || !sku || !imageUrl || !categoryId) {
      return apiResponse(res, 400, false, 'Name, price, SKU, image URL, and category ID are required');
    }

    const [existingSku] = await db.query('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existingSku.length > 0) {
      return apiResponse(res, 400, false, `SKU already exists: ${sku}`);
    }

    const [categoryRows] = await db.query('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (categoryRows.length === 0) {
      return apiResponse(res, 404, false, `Category not found with id: ${categoryId}`);
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now()}`;

    const [result] = await db.query(
      `INSERT INTO products 
        (name, slug, description, price, original_price, stock_quantity, sku, image_url, category_id, rating, review_count, is_best_seller, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        description,
        price,
        originalPrice != null ? originalPrice : price,
        stockQuantity,
        sku,
        imageUrl,
        categoryId,
        rating,
        reviewCount,
        isBestSeller ? 1 : 0,
        isActive ? 1 : 0,
      ]
    );

    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.description AS category_description, c.image_url AS category_image_url
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    return apiResponse(res, 201, true, 'Product created successfully', formatProduct(rows[0]));
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      originalPrice,
      stockQuantity,
      sku,
      imageUrl,
      categoryId,
      rating,
      reviewCount,
      isBestSeller,
      isActive,
    } = req.body;

    const [existingRows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return apiResponse(res, 404, false, `Product not found with id: ${id}`);
    }
    const current = existingRows[0];

    if (sku && sku !== current.sku) {
      const [skuCheck] = await db.query('SELECT id FROM products WHERE sku = ? AND id != ?', [sku, id]);
      if (skuCheck.length > 0) {
        return apiResponse(res, 400, false, `SKU already exists: ${sku}`);
      }
    }

    if (categoryId) {
      const [catCheck] = await db.query('SELECT id FROM categories WHERE id = ?', [categoryId]);
      if (catCheck.length === 0) {
        return apiResponse(res, 404, false, `Category not found with id: ${categoryId}`);
      }
    }

    await db.query(
      `UPDATE products SET 
        name = ?,
        description = ?,
        price = ?,
        original_price = ?,
        stock_quantity = ?,
        sku = ?,
        image_url = ?,
        category_id = ?,
        rating = ?,
        review_count = ?,
        is_best_seller = ?,
        is_active = ?
       WHERE id = ?`,
      [
        name != null ? name : current.name,
        description != null ? description : current.description,
        price != null ? price : current.price,
        originalPrice != null ? originalPrice : current.original_price,
        stockQuantity != null ? stockQuantity : current.stock_quantity,
        sku != null ? sku : current.sku,
        imageUrl != null ? imageUrl : current.image_url,
        categoryId != null ? categoryId : current.category_id,
        rating != null ? rating : current.rating,
        reviewCount != null ? reviewCount : current.review_count,
        isBestSeller != null ? (isBestSeller ? 1 : 0) : current.is_best_seller,
        isActive != null ? (isActive ? 1 : 0) : current.is_active,
        id,
      ]
    );

    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.description AS category_description, c.image_url AS category_image_url
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    return apiResponse(res, 200, true, 'Product updated successfully', formatProduct(rows[0]));
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return apiResponse(res, 404, false, `Product not found with id: ${id}`);
    }
    return apiResponse(res, 200, true, 'Product deactivated successfully');
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description = '', imageUrl = '' } = req.body;
    if (!name) {
      return apiResponse(res, 400, false, 'Category name is required');
    }

    const [existing] = await db.query('SELECT id FROM categories WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      return apiResponse(res, 400, false, `Category already exists: ${name}`);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const [result] = await db.query(
      'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
      [name.trim(), slug, description, imageUrl]
    );

    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    return apiResponse(res, 201, true, 'Category created successfully', formatCategory(rows[0]));
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;

    const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return apiResponse(res, 404, false, `Category not found with id: ${id}`);
    }
    const current = existing[0];

    await db.query(
      'UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?',
      [
        name != null ? name : current.name,
        description != null ? description : current.description,
        imageUrl != null ? imageUrl : current.image_url,
        id,
      ]
    );

    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return apiResponse(res, 200, true, 'Category updated successfully', formatCategory(rows[0]));
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return apiResponse(res, 404, false, `Category not found with id: ${id}`);
    }
    return apiResponse(res, 200, true, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(0, parseInt(req.query.page || '0', 10));
    const size = Math.max(1, parseInt(req.query.size || '10', 10));
    const offset = page * size;

    const [countResult] = await db.query('SELECT COUNT(*) AS total FROM orders');
    const totalElements = countResult[0].total;

    const [orderRows] = await db.query(
      `SELECT o.*, u.email, u.first_name, u.last_name,
              a.full_name AS address_full_name, a.phone AS address_phone, a.street_address, a.city, a.state, a.postal_code
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [size, offset]
    );

    const formattedList = [];
    for (const ord of orderRows) {
      const [itemRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
      formattedList.push(formatOrder(ord, itemRows));
    }

    return apiResponse(res, 200, true, 'All orders retrieved successfully', pageResponse(formattedList, page, size, totalElements));
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return apiResponse(res, 400, false, 'Status is required');
    }

    const upperStatus = status.toUpperCase();
    const isDelivered = upperStatus === 'DELIVERED';

    const [result] = await db.query(
      `UPDATE orders SET status = ?, payment_status = CASE WHEN ? THEN 'PAID' ELSE payment_status END WHERE id = ?`,
      [upperStatus, isDelivered, id]
    );

    if (result.affectedRows === 0) {
      return apiResponse(res, 404, false, `Order not found with id: ${id}`);
    }

    const [orderRows] = await db.query(
      `SELECT o.*, u.email, u.first_name, u.last_name,
              a.full_name AS address_full_name, a.phone AS address_phone, a.street_address, a.city, a.state, a.postal_code
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.id = ?`,
      [id]
    );

    const [itemRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

    return apiResponse(res, 200, true, 'Order status updated successfully', formatOrder(orderRows[0], itemRows));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllOrders,
  updateOrderStatus,
};
