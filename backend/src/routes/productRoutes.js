const express = require('express');
const ProductController = require('../controllers/productController');
const { productValidation } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/products
 * @desc Get all products with optional filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} search - Search in name, SKU, or description
 * @query {string} sortBy - Sort field (default: created_at)
 * @query {string} sortOrder - Sort order ASC/DESC (default: DESC)
 * @query {number} lowStock - Filter products with stock <= threshold
 * @access Public
 */
router.get('/', ProductController.getProducts);

// Временно закомментированы остальные маршруты
/*
router.get('/low-stock', ProductController.getLowStockProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', productValidation.create, ProductController.createProduct);
router.put('/bulk', ProductController.bulkUpdateProducts);
router.put('/:id', productValidation.update, ProductController.updateProduct);
router.patch('/:id/stock', ProductController.updateProductStock);
router.delete('/:id', ProductController.deleteProduct);
*/

module.exports = router;
