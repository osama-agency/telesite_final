const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * CustomerOrderItem model for PostgreSQL database
 * Represents individual items within customer orders
 */
const CustomerOrderItem = sequelize.define('CustomerOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customer_orders',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT' // Prevent deleting products that are in orders
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Quantity must be at least 1' },
      isInt: { msg: 'Quantity must be an integer' }
    }
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Unit price must be a positive number' },
      isDecimal: { msg: 'Unit price must be a valid decimal number' }
    }
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Total price must be a positive number' },
      isDecimal: { msg: 'Total price must be a valid decimal number' }
    }
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: { args: [0], msg: 'Discount amount cannot be negative' },
      isDecimal: { msg: 'Discount amount must be a valid decimal number' }
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'customer_order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['product_id'] },
    { fields: ['order_id', 'product_id'], unique: true } // Prevent duplicate products in same order
  ],
  hooks: {
    // Calculate total_price before saving
    beforeCreate: (item) => {
      item.calculateTotalPrice();
    },
    beforeUpdate: (item) => {
      item.calculateTotalPrice();
      item.updated_at = new Date();
    }
  }
});

/**
 * Instance methods
 */
CustomerOrderItem.prototype.toJSON = function() {
  const values = { ...this.get() };

  // Format decimal fields for JSON response
  if (values.unit_price) values.unit_price = parseFloat(values.unit_price);
  if (values.total_price) values.total_price = parseFloat(values.total_price);
  if (values.discount_amount) values.discount_amount = parseFloat(values.discount_amount);

  return values;
};

/**
 * Calculate total price based on quantity and unit price
 */
CustomerOrderItem.prototype.calculateTotalPrice = function() {
  const discountAmount = this.discount_amount || 0;
  this.total_price = (this.quantity * this.unit_price) - discountAmount;
  return this.total_price;
};

/**
 * Get discount percentage
 */
CustomerOrderItem.prototype.getDiscountPercentage = function() {
  if (!this.discount_amount || this.discount_amount === 0) return 0;

  const originalTotal = this.quantity * this.unit_price;
  if (originalTotal === 0) return 0;

  return ((this.discount_amount / originalTotal) * 100).toFixed(2);
};

/**
 * Apply discount by percentage
 */
CustomerOrderItem.prototype.applyDiscountPercentage = function(percentage) {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }

  const originalTotal = this.quantity * this.unit_price;
  this.discount_amount = (originalTotal * percentage) / 100;
  this.calculateTotalPrice();

  return this;
};

/**
 * Apply fixed discount amount
 */
CustomerOrderItem.prototype.applyDiscountAmount = function(amount) {
  if (amount < 0) {
    throw new Error('Discount amount cannot be negative');
  }

  const originalTotal = this.quantity * this.unit_price;
  if (amount > originalTotal) {
    throw new Error('Discount amount cannot exceed total price');
  }

  this.discount_amount = amount;
  this.calculateTotalPrice();

  return this;
};

/**
 * Update quantity and recalculate total
 */
CustomerOrderItem.prototype.updateQuantity = async function(newQuantity) {
  if (newQuantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  this.quantity = newQuantity;
  this.calculateTotalPrice();

  return await this.save();
};

/**
 * Static methods
 */

/**
 * Find items by order ID
 */
CustomerOrderItem.findByOrderId = function(orderId) {
  return this.findAll({
    where: { order_id: orderId },
    order: [['created_at', 'ASC']]
  });
};

/**
 * Find items by product ID
 */
CustomerOrderItem.findByProductId = function(productId) {
  return this.findAll({
    where: { product_id: productId },
    order: [['created_at', 'DESC']]
  });
};

/**
 * Get total quantity sold for a product
 */
CustomerOrderItem.getTotalQuantitySold = async function(productId, dateFrom = null, dateTo = null) {
  const whereClause = { product_id: productId };

  if (dateFrom && dateTo) {
    whereClause.created_at = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const result = await this.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity']
    ],
    where: whereClause,
    raw: true
  });

  return parseInt(result.total_quantity) || 0;
};

/**
 * Get revenue for a product
 */
CustomerOrderItem.getProductRevenue = async function(productId, dateFrom = null, dateTo = null) {
  const whereClause = { product_id: productId };

  if (dateFrom && dateTo) {
    whereClause.created_at = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const result = await this.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
    ],
    where: whereClause,
    raw: true
  });

  return parseFloat(result.total_revenue) || 0;
};

/**
 * Bulk create order items with validation
 */
CustomerOrderItem.bulkCreateItems = async function(items, transaction = null) {
  // Validate and calculate totals for each item
  const processedItems = items.map(item => {
    const discountAmount = item.discount_amount || 0;
    const totalPrice = (item.quantity * item.unit_price) - discountAmount;

    return {
      ...item,
      total_price: totalPrice,
      created_at: new Date(),
      updated_at: new Date()
    };
  });

  return await this.bulkCreate(processedItems, {
    transaction,
    validate: true,
    returning: true
  });
};

module.exports = CustomerOrderItem;
