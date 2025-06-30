const express = require('express');
const cityController = require('../controllers/city.controller');

const router = express.Router();

// Tüm şehirleri getirme rotası
router.get('/', cityController.getAllCities);

module.exports = router; 