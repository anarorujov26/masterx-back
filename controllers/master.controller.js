const Master = require('../models/master.model');

/**
 * Bütün ustaların listesini almaq (ortalama dəyərləndirmə ilə)
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getAllMastersWithRating = async (req, res) => {
  try {
    const masters = await Master.getAllMastersWithRating();
    
    res.json({
      success: true,
      message: 'Ustaların siyahısı uğurla alındı',
      data: masters
    });
  } catch (error) {
    console.error('Get all masters with rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Usta profilini almaq (ortalama dəyərləndirmə, tamamlanmış iş sayı və bacarıqları ilə)
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getMasterProfileWithStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Usta ID düzgün formatda deyil'
      });
    }
    
    const masterProfile = await Master.getMasterProfileWithStats(parseInt(id));
    
    if (!masterProfile) {
      return res.status(404).json({
        success: false,
        message: 'Usta tapılmadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Usta profili uğurla alındı',
      data: masterProfile
    });
  } catch (error) {
    console.error('Get master profile with stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Ustanın kateqoriyalara görə performansını almaq
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getMasterCategoryPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Usta ID düzgün formatda deyil'
      });
    }
    
    // Önce ustanın var olduğunu kontrol edelim
    const master = await Master.findById(parseInt(id));
    
    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Usta tapılmadı'
      });
    }
    
    const categoryPerformance = await Master.getMasterCategoryPerformance(parseInt(id));
    
    res.json({
      success: true,
      message: 'Ustanın kateqoriyalara görə performansı uğurla alındı',
      data: categoryPerformance
    });
  } catch (error) {
    console.error('Get master category performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Ustanın müəyyən kateqoriyada tamamladığı işləri və dəyərləndirmələri almaq
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getMasterCompletedJobsByCategory = async (req, res) => {
  try {
    const { id, category_id } = req.params;
    
    if (!id || isNaN(id) || !category_id || isNaN(category_id)) {
      return res.status(400).json({
        success: false,
        message: 'Usta ID və ya kateqoriya ID düzgün formatda deyil'
      });
    }
    
    // Önce ustanın var olduğunu kontrol edelim
    const master = await Master.findById(parseInt(id));
    
    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Usta tapılmadı'
      });
    }
    
    // Ustanın bu kategoride tamamlanmış işi olup olmadığını kontrol edelim
    const categoryPerformance = await Master.getMasterCategoryPerformance(parseInt(id));
    const hasCompletedJobsInCategory = categoryPerformance.some(
      category => category.category_id === parseInt(category_id)
    );
    
    if (!hasCompletedJobsInCategory) {
      return res.status(404).json({
        success: false,
        message: 'Ustanın bu kateqoriyada tamamlanmış işi tapılmadı'
      });
    }
    
    const completedJobs = await Master.getMasterCompletedJobsByCategory(parseInt(id), parseInt(category_id));
    
    res.json({
      success: true,
      message: 'Ustanın tamamladığı işlər və dəyərləndirmələr uğurla alındı',
      data: completedJobs
    });
  } catch (error) {
    console.error('Get master completed jobs by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Giriş yapmış ustanın şəhər və kateqoriya ID'lərini almaq
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getMasterCityAndCategories = async (req, res) => {
  try {
    const masterId = req.user.id;
    
    // Sadece ustalar için
    if (req.user.role !== 'master') {
      return res.status(403).json({
        success: false,
        message: 'Bu endpoint yalnız ustalar tərəfindən istifadə edilə bilər'
      });
    }
    
    // Usta bilgilerini alalım
    const master = await Master.findById(masterId);
    
    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Usta tapılmadı'
      });
    }
    
    // Sadece şehir ID ve kategori ID'lerini döndürelim
    const result = {
      city_id: master.city ? master.city.id : null,
      category_ids: master.skills.map(skill => skill.category_id)
    };
    
    res.json({
      success: true,
      message: 'Usta şəhər və kateqoriya məlumatları uğurla alındı',
      data: result
    });
  } catch (error) {
    console.error('Get master city and categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
}; 