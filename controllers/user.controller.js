const User = require('../models/user.model');

/**
 * İstifadəçi telefon nömrəsini almaq
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getCustomerPhone = async (req, res) => {
  try {
    const { customer_id } = req.params;
    
    // ID'nin doğru formatda olub-olmadığını yoxlayırıq
    if (!customer_id || isNaN(customer_id)) {
      return res.status(400).json({
        success: false,
        message: 'Düzgün istifadəçi ID təqdim edilməlidir'
      });
    }
    
    // İstifadəçini tapırıq
    const user = await User.getPhoneById(customer_id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'İstifadəçi tapılmadı'
      });
    }
    
    res.json({
      success: true,
      message: 'İstifadəçi telefon nömrəsi uğurla alındı',
      data: {
        customer_id: user.id,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Get customer phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
}; 