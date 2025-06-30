const jwt = require('jsonwebtoken');

/**
 * JWT token yaratmaq üçün funksiya
 * @param {Object} payload - Token'a əlavə ediləcək məlumatlar
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * Token'i doğrulama funksiyası
 * @param {String} token - Doğrulanacaq JWT token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token etibarsızdır');
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 