const express = require('express');
const masterController = require('../controllers/master.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Token olmadan erişilebilen rotalar
// Tüm ustaların listesini getirme rotası (ortalama derecelendirme ile)
router.get('/', masterController.getAllMastersWithRating);

// Token ile erişilebilen rotalar (sadece ustalar için)
// Giriş yapmış ustanın şehir ve kategori ID'lerini getirme rotası
router.get('/my-info', authenticate, authorize('master'), masterController.getMasterCityAndCategories);

// Usta profil detaylarını getirme rotası (ortalama derecelendirme, tamamlanmış iş sayısı ve beceriler ile)
router.get('/:id/profile', masterController.getMasterProfileWithStats);

// Ustanın kategorilere göre performansını getirme rotası
router.get('/:id/performance', masterController.getMasterCategoryPerformance);

// Ustanın belirli bir kategorideki tamamlanmış işlerini ve değerlendirmelerini getirme rotası
router.get('/:id/completed-jobs/:category_id', masterController.getMasterCompletedJobsByCategory);

module.exports = router; 