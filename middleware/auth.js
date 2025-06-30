const { verifyToken } = require('../utils/jwt');

/**
 * Authentication middleware - JWT token doğrulaması edir
 */
const authenticate = (req, res, next) => {
  try {
    // Token'i header'dən alırıq
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Giriş etmək üçün token təqdim edilməlidir'
      });
    }
    
    // Bearer prefix'ini silərək token'i alırıq
    const token = authHeader.split(' ')[1];
    
    // Token'i yoxlayırıq
    const decoded = verifyToken(token);
    
    // İstifadəçi məlumatlarını request'ə əlavə edirik
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token etibarsızdır və ya müddəti bitib'
    });
  }
};

/**
 * İstifadəçi növünü yoxlayan middleware
 * @param {String} role - Tələb olunan rol ("user" və ya "master")
 */
const authorize = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: 'Bu əməliyyat üçün icazəniz yoxdur'
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
}; 