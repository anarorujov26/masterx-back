const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Kullanıcı kayıt/giriş rotaları
router.post('/register', authController.register);
router.post('/login', authController.login);

// Usta kayıt/giriş rotaları
router.post('/master/register', authController.registerMaster);
router.post('/master/login', authController.loginMaster);

// Kullanıcı bilgileri rotası
router.get('/me', authenticate, authController.getMe);

module.exports = router; 