const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

const router = express.Router();

// İstifadəçi telefon nömrəsini almaq
router.get('/phone/:customer_id', userController.getCustomerPhone);

// İleride kullanıcı işlemleri için rotalar buraya eklenecek

module.exports = router; 