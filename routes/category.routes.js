const express = require('express');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

// Tüm kategorileri getirme rotası
router.get('/', categoryController.getAllCategories);

module.exports = router; 