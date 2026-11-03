const db = require('../config/db');
const { apiResponse, pageResponse } = require('../utils/response');

const formatProduct = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  price: Number(row.price),
  originalPrice: Number(row.original_price != null ? row.original_price : row.price),
  stockQuantity: Number(row.stock_quantity),
  sku: row.sku,
  imageUrl: row.image_url,
  category: {
    id: row.category_id,
    name: row.category_name || '',
    slug: row.category_slug || '',
    description: row.category_description || '',
    imageUrl: row.category_image_url || '',
  },
  rating: Number(row.rating || 0),
  reviewCount: Number(row.review_count || 0),
  isBestSeller: Boolean(row.is_best_seller),
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
});

const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(0, parseInt(req.query.page || '0', 10));
    const size = Math.max(1, parseInt(req.query.size || '12', 10));
    const sortBy = ['id', 'price', 'name', 'rating', 'createdAt'].includes(req.query.sortBy)
      ? req.query.sortBy === 'createdAt' ? 'created_at' : req.query.sortBy
      : 'id';
    const sortDir = req.query.sortDir && req.query.sortDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : null;

    let whereClause = 'WHERE p.is_active = TRUE';
    const params = [];

    if (categoryId && !isNaN(categoryId)) {
      whereClause += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    const countSql = `SELECT COUNT(*) AS total FROM products p ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const totalElements = countResult[0].total;

    const offset = page * size;
    const dataSql = `
      SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        c.description AS category_description,
        c.image_url AS category_image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortDir}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...params, size, offset]);
    const content = rows.map(formatProduct);

    return apiResponse(res, 200, true, 'Products retrieved successfully', pageResponse(content, page, size, totalElements));
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const query = req.query.query ? req.query.query.trim() : '';
    const page = Math.max(0, parseInt(req.query.page || '0', 10));
    const size = Math.max(1, parseInt(req.query.size || '12', 10));

    if (!query) {
      return apiResponse(res, 200, true, 'Products retrieved successfully', pageResponse([], page, size, 0));
    }

    const searchPattern = `%${query}%`;
    const whereClause = 'WHERE p.is_active = TRUE AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
    const params = [searchPattern, searchPattern, searchPattern];

    const countSql = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const [countResult] = await db.query(countSql, params);
    const totalElements = countResult[0].total;

    const offset = page * size;
    const dataSql = `
      SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        c.description AS category_description,
        c.image_url AS category_image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...params, size, offset]);
    const content = rows.map(formatProduct);

    return apiResponse(res, 200, true, 'Products found successfully', pageResponse(content, page, size, totalElements));
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dataSql = `
      SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        c.description AS category_description,
        c.image_url AS category_image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const [rows] = await db.query(dataSql, [id]);
    if (rows.length === 0) {
      return apiResponse(res, 404, false, `Product not found with id: ${id}`);
    }
    return apiResponse(res, 200, true, 'Product retrieved successfully', formatProduct(rows[0]));
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const dataSql = `
      SELECT 
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        c.description AS category_description,
        c.image_url AS category_image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `;
    const [rows] = await db.query(dataSql, [slug]);
    if (rows.length === 0) {
      return apiResponse(res, 404, false, `Product not found with slug: ${slug}`);
    }
    return apiResponse(res, 200, true, 'Product retrieved successfully', formatProduct(rows[0]));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  formatProduct,
  getProducts,
  searchProducts,
  getProductById,
  getProductBySlug,
};
