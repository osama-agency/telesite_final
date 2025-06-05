const express = require('express');
const ProductController = require('../controllers/ProductController');
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
router.get('/', ProductController.getAllProducts);

/**
 * @route GET /api/products/low-stock
 * @desc Get products with low stock
 * @query {number} threshold - Stock threshold (default: 10)
 * @access Public
 */
router.get('/low-stock', ProductController.getLowStockProducts);

/**
 * @route GET /api/products/search
 * @desc Search products by name or SKU
 * @query {string} q - Search query (required)
 * @access Public
 */
router.get('/search', ProductController.searchProducts);

/**
 * @route GET /api/products/:id
 * @desc Get single product by ID
 * @param {string} id - Product ID
 * @access Public
 */
router.get('/:id', ProductController.getProductById);

/**
 * @route POST /api/products
 * @desc Create new product
 * @body {string} name - Product name (required)
 * @body {string} sku - Unique SKU (required)
 * @body {string} description - Product description
 * @body {number} price - Product price (required)
 * @body {number} cost_price - Cost price
 * @body {number} quantity_in_stock - Initial stock quantity (default: 0)
 * @access Private
 */
router.post('/', productValidation.create, ProductController.createProduct);

/**
 * @route PUT /api/products/bulk
 * @desc Bulk update products
 * @body {array} products - Array of product objects with id and update data
 * @access Private
 */
router.put('/bulk', ProductController.bulkUpdateProducts);

/**
 * @route PUT /api/products/:id
 * @desc Update product
 * @param {string} id - Product ID
 * @body Product update data
 * @access Private
 */
router.put('/:id', productValidation.update, ProductController.updateProduct);

/**
 * @route PATCH /api/products/:id/stock
 * @desc Update product stock quantity
 * @param {string} id - Product ID
 * @body {number} quantity - Quantity to set/add/subtract
 * @body {string} operation - Operation type: 'set', 'add', 'subtract' (default: 'set')
 * @access Private
 */
router.patch('/:id/stock', ProductController.updateProductStock);

/**
 * @route DELETE /api/products/:id
 * @desc Delete product
 * @param {string} id - Product ID
 * @access Private
 */
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
