const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { apiResponse } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponse(res, 401, false, 'Unauthorized: Missing or invalid token format');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return apiResponse(res, 401, false, 'Unauthorized: Token expired or invalid');
    }

    const email = decoded.sub || decoded.email;
    if (!email) {
      return apiResponse(res, 401, false, 'Unauthorized: Invalid token payload');
    }

    const [rows] = await db.query(
      'SELECT id, email, first_name AS firstName, last_name AS lastName, phone, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return apiResponse(res, 401, false, 'Unauthorized: User no longer exists');
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error);
    return apiResponse(res, 500, false, 'Authentication failed');
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse(res, 401, false, 'Unauthorized');
    }
    if (req.user.role !== role) {
      return apiResponse(res, 403, false, 'Access Denied: Insufficient permissions');
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
};
