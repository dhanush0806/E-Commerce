const db = require('../config/db');
const { apiResponse } = require('../utils/response');

const formatCategory = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  imageUrl: row.image_url,
});

const getAllCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    return apiResponse(res, 200, true, 'Categories retrieved successfully', rows.map(formatCategory));
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (rows.length === 0) {
      return apiResponse(res, 404, false, `Category not found with id: ${id}`);
    }
    return apiResponse(res, 200, true, 'Category retrieved successfully', formatCategory(rows[0]));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  formatCategory,
  getAllCategories,
  getCategoryById,
};
