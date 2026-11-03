const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { apiResponse } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.email,
      email: user.email,
      role: user.role,
      id: user.id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return apiResponse(res, 400, false, 'Email, password, first name, and last name are required');
    }

    if (password.length < 6) {
      return apiResponse(res, 400, false, 'Password must be at least 6 characters');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return apiResponse(res, 400, false, `Email is already registered: ${normalizedEmail}`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'ROLE_CUSTOMER';

    const [insertResult] = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [normalizedEmail, hashedPassword, firstName.trim(), lastName.trim(), phone || null, role]
    );

    const userId = insertResult.insertId;

    // Create user cart
    await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);

    const user = {
      id: userId,
      email: normalizedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
    };

    const token = generateToken(user);

    return apiResponse(res, 201, true, 'User registered successfully', {
      token,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return apiResponse(res, 400, false, 'Email and password are required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [rows] = await db.query(
      'SELECT id, email, password, first_name AS firstName, last_name AS lastName, role FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return apiResponse(res, 401, false, 'Invalid email or password');
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return apiResponse(res, 401, false, 'Invalid email or password');
    }

    const token = generateToken(user);

    return apiResponse(res, 200, true, 'Login successful', {
      token,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;
    return apiResponse(res, 200, true, 'Current user retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    if (!firstName || !lastName) {
      return apiResponse(res, 400, false, 'First name and last name are required');
    }

    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
      [firstName.trim(), lastName.trim(), phone || null, req.user.id]
    );

    const [rows] = await db.query(
      'SELECT id, email, first_name AS firstName, last_name AS lastName, phone, role FROM users WHERE id = ?',
      [req.user.id]
    );

    return apiResponse(res, 200, true, 'Profile updated successfully', rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
};
