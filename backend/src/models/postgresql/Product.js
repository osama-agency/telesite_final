const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * Product model for PostgreSQL database
 * Represents products in the inventory system
 */
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Product name is required' },
      len: { args: [1, 255], msg: 'Product name must be between 1 and 255 characters' }
    }
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'SKU is required' },
      len: { args: [1, 100], msg: 'SKU must be between 1 and 100 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 5000], msg: 'Description cannot exceed 5000 characters' }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Price must be a positive number' },
      isDecimal: { msg: 'Price must be a valid decimal number' }
    }
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Cost price must be a positive number' },
      isDecimal: { msg: 'Cost price must be a valid decimal number' }
    }
  },
  quantity_in_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Quantity in stock cannot be negative' },
      isInt: { msg: 'Quantity in stock must be an integer' }
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
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['sku'], unique: true },
    { fields: ['name'] },
    { fields: ['created_at'] }
  ],
  hooks: {
    // Update the updated_at field before each update
    beforeUpdate: (product) => {
      product.updated_at = new Date();
    }
  }
});

/**
 * Instance methods
 */
Product.prototype.toJSON = function() {
  const values = { ...this.get() };

  // Format decimal fields for JSON response
  if (values.price) values.price = parseFloat(values.price);
  if (values.cost_price) values.cost_price = parseFloat(values.cost_price);

  return values;
};

/**
 * Check if product is in stock
 */
Product.prototype.isInStock = function(quantity = 1) {
  return this.quantity_in_stock >= quantity;
};

/**
 * Calculate profit margin
 */
Product.prototype.getProfitMargin = function() {
  if (!this.cost_price || this.cost_price === 0) return null;
  return ((this.price - this.cost_price) / this.cost_price * 100).toFixed(2);
};

/**
 * Static methods
 */

/**
 * Find products with low stock
 */
Product.findLowStock = function(threshold = 10) {
  return this.findAll({
    where: {
      quantity_in_stock: {
        [sequelize.Sequelize.Op.lte]: threshold
      }
    },
    order: [['quantity_in_stock', 'ASC']]
  });
};

/**
 * Search products by name or SKU
 */
Product.search = function(query) {
  return this.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        {
          name: {
            [sequelize.Sequelize.Op.iLike]: `%${query}%`
          }
        },
        {
          sku: {
            [sequelize.Sequelize.Op.iLike]: `%${query}%`
          }
        }
      ]
    }
  });
};

module.exports = Product;
