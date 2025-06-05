/**
 * Validation middleware for API requests
 * Uses express-validator for request validation
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Check validation results and return errors if any
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Product validation rules
 */
const productValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Product name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Product name must be between 2 and 255 characters'),
    body('sku')
      .trim()
      .notEmpty().withMessage('SKU is required')
      .isLength({ min: 2, max: 100 }).withMessage('SKU must be between 2 and 100 characters'),
    body('price')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('cost')
      .optional()
      .isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    body('stock')
      .optional()
      .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('minStock')
      .optional()
      .isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
    body('category')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
    handleValidationErrors
  ],

  update: [
    param('id').isInt().withMessage('Invalid product ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Product name cannot be empty')
      .isLength({ min: 2, max: 255 }).withMessage('Product name must be between 2 and 255 characters'),
    body('sku')
      .optional()
      .trim()
      .notEmpty().withMessage('SKU cannot be empty')
      .isLength({ min: 2, max: 100 }).withMessage('SKU must be between 2 and 100 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('cost')
      .optional()
      .isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    body('stock')
      .optional()
      .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('minStock')
      .optional()
      .isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
    handleValidationErrors
  ],

  getById: [
    param('id').isInt().withMessage('Invalid product ID'),
    handleValidationErrors
  ],

  search: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1 }).withMessage('Search query must not be empty'),
    query('category')
      .optional()
      .trim(),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
    handleValidationErrors
  ]
};

/**
 * Order validation rules
 */
const orderValidation = {
  create: [
    body('customerName')
      .trim()
      .notEmpty().withMessage('Customer name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Customer name must be between 2 and 255 characters'),
    body('customerEmail')
      .optional()
      .trim()
      .isEmail().withMessage('Invalid email format'),
    body('customerPhone')
      .optional()
      .trim()
      .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format'),
    body('shippingAddress')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Shipping address must not exceed 500 characters'),
    body('items')
      .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId')
      .isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('items.*.quantity')
      .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('items.*.discount')
      .optional()
      .isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
    handleValidationErrors
  ],

  updateStatus: [
    param('id').isInt().withMessage('Invalid order ID'),
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    handleValidationErrors
  ],

  getById: [
    param('id').isInt().withMessage('Invalid order ID'),
    handleValidationErrors
  ]
};

/**
 * Warehouse order validation rules
 */
const warehouseOrderValidation = {
  create: [
    body('supplierName')
      .trim()
      .notEmpty().withMessage('Supplier name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Supplier name must be between 2 and 255 characters'),
    body('supplierEmail')
      .optional()
      .trim()
      .isEmail().withMessage('Invalid email format'),
    body('supplierPhone')
      .optional()
      .trim()
      .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format'),
    body('expectedDeliveryDate')
      .optional()
      .isISO8601().withMessage('Invalid date format'),
    body('items')
      .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId')
      .isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('items.*.quantity')
      .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.unitCost')
      .isFloat({ min: 0 }).withMessage('Unit cost must be a positive number'),
    handleValidationErrors
  ],

  receive: [
    param('id').isInt().withMessage('Invalid warehouse order ID'),
    body('items')
      .isArray({ min: 1 }).withMessage('Must specify items to receive'),
    body('items.*.itemId')
      .isInt({ min: 1 }).withMessage('Invalid item ID'),
    body('items.*.receivedQuantity')
      .isInt({ min: 0 }).withMessage('Received quantity must be non-negative'),
    handleValidationErrors
  ],

  getById: [
    param('id').isInt().withMessage('Invalid warehouse order ID'),
    handleValidationErrors
  ]
};

/**
 * Expense validation rules
 */
const expenseValidation = {
  create: [
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 2, max: 500 }).withMessage('Description must be between 2 and 500 characters'),
    body('amount')
      .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('category')
      .trim()
      .notEmpty().withMessage('Category is required')
      .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
    body('date')
      .optional()
      .isISO8601().withMessage('Invalid date format'),
    body('vendor')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Vendor name must not exceed 255 characters'),
    body('paymentMethod')
      .optional()
      .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'other'])
      .withMessage('Invalid payment method'),
    body('isRecurring')
      .optional()
      .isBoolean().withMessage('isRecurring must be a boolean'),
    body('isTaxDeductible')
      .optional()
      .isBoolean().withMessage('isTaxDeductible must be a boolean'),
    handleValidationErrors
  ],

  update: [
    param('id').isInt().withMessage('Invalid expense ID'),
    body('description')
      .optional()
      .trim()
      .notEmpty().withMessage('Description cannot be empty')
      .isLength({ min: 2, max: 500 }).withMessage('Description must be between 2 and 500 characters'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('category')
      .optional()
      .trim()
      .notEmpty().withMessage('Category cannot be empty')
      .isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
    body('date')
      .optional()
      .isISO8601().withMessage('Invalid date format'),
    handleValidationErrors
  ],

  getById: [
    param('id').isInt().withMessage('Invalid expense ID'),
    handleValidationErrors
  ],

  getByDateRange: [
    query('startDate')
      .notEmpty().withMessage('Start date is required')
      .isISO8601().withMessage('Invalid start date format'),
    query('endDate')
      .notEmpty().withMessage('End date is required')
      .isISO8601().withMessage('Invalid end date format')
      .custom((value, { req }) => {
        if (new Date(value) < new Date(req.query.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

/**
 * Common validation rules
 */
const commonValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],

  idParam: [
    param('id').isInt().withMessage('Invalid ID'),
    handleValidationErrors
  ]
};

module.exports = {
  productValidation,
  orderValidation,
  warehouseOrderValidation,
  expenseValidation,
  commonValidation,
  handleValidationErrors
};
