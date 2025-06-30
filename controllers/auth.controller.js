const User = require('../models/user.model');
const Master = require('../models/master.model');
const Category = require('../models/category.model');
const City = require('../models/city.model');
const { generateToken } = require('../utils/jwt');

/**
 * Kullanıcı kaydı
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.register = async (req, res) => {
  try {
    const { name, surname, email, password, phone } = req.body;
    
    // Məcburi sahələrin yoxlanması
    if (!name || !surname || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Bütün məlumatlar daxil edilməlidir'
      });
    }

    // Emailin unikalliğını yoxlayırıq
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email artıq qeydiyyatdan keçib'
      });
    }

    // İstifadəçini yaradırıq
    const user = await User.create({ name, surname, email, password, phone });

    // Token yaradırıq
    const token = generateToken({ 
      id: user.id, 
      email: user.email,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      message: 'İstifadəçi uğurla qeydiyyatdan keçdi',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Kullanıcı girişi
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Məcburi sahələrin yoxlanması
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email və şifrə daxil edilməlidir'
      });
    }

    // İstifadəçini tapırıq
    const user = await User.findByEmail(email);
    
    // İstifadəçi tapılmadısa və ya şifrə yanlışdırsa, xəta qaytarırıq
    if (!user || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Yanlış email və ya şifrə'
      });
    }

    // İstifadəçi məlumatlarından şifrəni silmək
    const { password: _, ...userWithoutPassword } = user;

    // Token yaradırıq
    const token = generateToken({ 
      id: user.id, 
      email: user.email,
      role: 'user'
    });

    res.json({
      success: true,
      message: 'Giriş uğurludur',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Usta kaydı
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.registerMaster = async (req, res) => {
  try {
    const { name, surname, email, password, phone, city_id, categories } = req.body;
    
    if (!name || !surname || !email || !password || !phone || !city_id || !categories) {
      return res.status(400).json({
        success: false,
        message: 'Bütün məlumatlar daxil edilməlidir'
      });
    }

    const existingMaster = await Master.findByEmail(email);
    if (existingMaster) {
      return res.status(400).json({
        success: false,
        message: 'Bu email artıq qeydiyyatdan keçib'
      });
    }

    const city = await City.findById(city_id);
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'Seçilmiş şəhər tapılmadı'
      });
    }

    const areValidCategories = await Category.validateIds(categories);
    if (!areValidCategories) {
      return res.status(400).json({
        success: false,
        message: 'Seçilmiş kateqoriyalar mövcud deyil'
      });
    }

    const master = await Master.create(
      { name, surname, email, password, phone, city_id },
      categories
    );

    const token = generateToken({ 
      id: master.id, 
      email: master.email,
      role: 'master'
    });

    res.status(201).json({
      success: true,
      message: 'Usta uğurla qeydiyyatdan keçdi',
      data: {
        master,
        token
      }
    });
  } catch (error) {
    console.error('Register master error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Usta girişi
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.loginMaster = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Məcburi sahələrin yoxlanması
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email və şifrə daxil edilməlidir'
      });
    }

    // Ustanı tapırıq
    const master = await Master.findByEmail(email);
    
    // Usta tapılmadısa və ya şifrə yanlışdırsa, xəta qaytarırıq
    if (!master || !(await Master.comparePassword(password, master.password))) {
      return res.status(401).json({
        success: false,
        message: 'Yanlış email və ya şifrə'
      });
    }

    // Usta məlumatlarından şifrəni silmək
    const { password: _, ...masterWithoutPassword } = master;

    // Əlavə məlumatlar ilə ustanı alırıq
    const masterDetails = await Master.findById(master.id);

    // Token yaradırıq
    const token = generateToken({ 
      id: master.id, 
      email: master.email,
      role: 'master'
    });

    res.json({
      success: true,
      message: 'Giriş uğurludur',
      data: {
        master: masterDetails,
        token
      }
    });
  } catch (error) {
    console.error('Login master error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Kullanıcı bilgilerini getirme
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    let userData;
    
    if (role === 'user') {
      userData = await User.findById(id);
      if (!userData) {
        return res.status(404).json({
          success: false,
          message: 'İstifadəçi tapılmadı'
        });
      }
    } else if (role === 'master') {
      userData = await Master.findById(id);
      if (!userData) {
        return res.status(404).json({
          success: false,
          message: 'Usta tapılmadı'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Naməlum istifadəçi tipi'
      });
    }
    
    res.json({
      success: true,
      message: 'İstifadəçi məlumatları uğurla alındı',
      data: {
        user: userData,
        role
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
}; 