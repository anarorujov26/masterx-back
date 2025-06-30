const Category = require('../models/category.model');

/**
 * Tüm kategorileri getirme
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    
    res.json({
      success: true,
      message: 'Kateqoriyalar uğurla alındı',
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
}; 