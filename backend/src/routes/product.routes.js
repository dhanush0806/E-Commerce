const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/search', productController.searchProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);
router.get('/', productController.getProducts);

module.exports = router;
