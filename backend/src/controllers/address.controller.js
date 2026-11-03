const db = require('../config/db');
const { apiResponse } = require('../utils/response');

const formatAddress = (row) => ({
  id: row.id,
  fullName: row.full_name,
  phone: row.phone,
  streetAddress: row.street_address,
  city: row.city,
  state: row.state,
  postalCode: row.postal_code,
  country: row.country,
  isDefault: Boolean(row.is_default),
});

const getUserAddresses = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    return apiResponse(res, 200, true, 'Addresses retrieved successfully', rows.map(formatAddress));
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, streetAddress, city, state, postalCode, country = 'India', isDefault = false } = req.body;

    if (!fullName || !phone || !streetAddress || !city || !state || !postalCode) {
      return apiResponse(res, 400, false, 'Full name, phone, street address, city, state, and postal code are required');
    }

    if (isDefault) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await db.query(
      `INSERT INTO addresses (user_id, full_name, phone, street_address, city, state, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, fullName, phone, streetAddress, city, state, postalCode, country, isDefault ? 1 : 0]
    );

    const [rows] = await db.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);
    return apiResponse(res, 201, true, 'Address added successfully', formatAddress(rows[0]));
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);

    if (result.affectedRows === 0) {
      return apiResponse(res, 404, false, 'Address not found');
    }

    return apiResponse(res, 200, true, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  formatAddress,
  getUserAddresses,
  addAddress,
  deleteAddress,
};
