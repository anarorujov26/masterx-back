const City = require('../models/city.model');

/**
 * Tüm şehirleri getirme
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.getAll();
    
    res.json({
      success: true,
      message: 'Şəhərlər uğurla alındı',
      data: cities
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
}; 