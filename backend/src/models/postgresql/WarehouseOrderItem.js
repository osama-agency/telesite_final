const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * WarehouseOrderItem model for PostgreSQL database
 * Represents individual items within warehouse orders
 */
const WarehouseOrderItem = sequelize.define('WarehouseOrderItem', {
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
      model: 'warehouse_orders',
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
    onDelete: 'RESTRICT'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Quantity must be at least 1' },
      isInt: { msg: 'Quantity must be an integer' }
    }
  },
  unit_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Unit cost must be a positive number' },
      isDecimal: { msg: 'Unit cost must be a valid decimal number' }
    }
  },
  total_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Total cost must be a positive number' },
      isDecimal: { msg: 'Total cost must be a valid decimal number' }
    }
  },
  received_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Received quantity cannot be negative' },
      isInt: { msg: 'Received quantity must be an integer' }
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
  tableName: 'warehouse_order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['product_id'] },
    { fields: ['order_id', 'product_id'], unique: true }
  ],
  hooks: {
    beforeCreate: (item) => {
      item.calculateTotalCost();
    },
    beforeUpdate: (item) => {
      item.calculateTotalCost();
      item.updated_at = new Date();
    }
  }
});

/**
 * Instance methods
 */
WarehouseOrderItem.prototype.toJSON = function() {
  const values = { ...this.get() };

  // Format decimal fields for JSON response
  if (values.unit_cost) values.unit_cost = parseFloat(values.unit_cost);
  if (values.total_cost) values.total_cost = parseFloat(values.total_cost);

  return values;
};

/**
 * Calculate total cost based on quantity and unit cost
 */
WarehouseOrderItem.prototype.calculateTotalCost = function() {
  this.total_cost = this.quantity * this.unit_cost;
  return this.total_cost;
};

/**
 * Check if item is fully received
 */
WarehouseOrderItem.prototype.isFullyReceived = function() {
  return this.received_quantity >= this.quantity;
};

/**
 * Check if item is partially received
 */
WarehouseOrderItem.prototype.isPartiallyReceived = function() {
  return this.received_quantity > 0 && this.received_quantity < this.quantity;
};

/**
 * Get pending quantity (not yet received)
 */
WarehouseOrderItem.prototype.getPendingQuantity = function() {
  return Math.max(0, this.quantity - (this.received_quantity || 0));
};

/**
 * Update received quantity
 */
WarehouseOrderItem.prototype.updateReceivedQuantity = async function(receivedQty) {
  if (receivedQty < 0) {
    throw new Error('Received quantity cannot be negative');
  }

  if (receivedQty > this.quantity) {
    throw new Error('Received quantity cannot exceed ordered quantity');
  }

  this.received_quantity = receivedQty;
  return await this.save();
};

/**
 * Calculate cost per unit received
 */
WarehouseOrderItem.prototype.getCostPerUnitReceived = function() {
  if (!this.received_quantity || this.received_quantity === 0) {
    return 0;
  }

  return this.total_cost / this.received_quantity;
};

/**
 * Static methods
 */

/**
 * Find items by order ID
 */
WarehouseOrderItem.findByOrderId = function(orderId) {
  return this.findAll({
    where: { order_id: orderId },
    order: [['created_at', 'ASC']]
  });
};

/**
 * Find items by product ID
 */
WarehouseOrderItem.findByProductId = function(productId) {
  return this.findAll({
    where: { product_id: productId },
    order: [['created_at', 'DESC']]
  });
};

/**
 * Get total quantity ordered for a product
 */
WarehouseOrderItem.getTotalQuantityOrdered = async function(productId, dateFrom = null, dateTo = null) {
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
 * Get total cost for a product
 */
WarehouseOrderItem.getTotalCost = async function(productId, dateFrom = null, dateTo = null) {
  const whereClause = { product_id: productId };

  if (dateFrom && dateTo) {
    whereClause.created_at = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const result = await this.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_cost')), 'total_cost']
    ],
    where: whereClause,
    raw: true
  });

  return parseFloat(result.total_cost) || 0;
};

/**
 * Get average cost per unit for a product
 */
WarehouseOrderItem.getAverageCostPerUnit = async function(productId, dateFrom = null, dateTo = null) {
  const whereClause = { product_id: productId };

  if (dateFrom && dateTo) {
    whereClause.created_at = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const result = await this.findOne({
    attributes: [
      [sequelize.fn('AVG', sequelize.col('unit_cost')), 'avg_cost']
    ],
    where: whereClause,
    raw: true
  });

  return parseFloat(result.avg_cost) || 0;
};

/**
 * Find items with partial deliveries
 */
WarehouseOrderItem.findPartialDeliveries = function() {
  return this.findAll({
    where: {
      received_quantity: {
        [sequelize.Sequelize.Op.gt]: 0,
        [sequelize.Sequelize.Op.lt]: sequelize.col('quantity')
      }
    },
    order: [['created_at', 'DESC']]
  });
};

/**
 * Find items with delivery discrepancies
 */
WarehouseOrderItem.findDeliveryDiscrepancies = function() {
  return this.findAll({
    where: {
      received_quantity: {
        [sequelize.Sequelize.Op.ne]: sequelize.col('quantity')
      }
    },
    order: [['created_at', 'DESC']]
  });
};

/**
 * Bulk create warehouse order items with validation
 */
WarehouseOrderItem.bulkCreateItems = async function(items, transaction = null) {
  // Validate and calculate totals for each item
  const processedItems = items.map(item => {
    const totalCost = item.quantity * item.unit_cost;

    return {
      ...item,
      total_cost: totalCost,
      received_quantity: 0,
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

/**
 * Get purchase history for a product
 */
WarehouseOrderItem.getPurchaseHistory = async function(productId, limit = 10) {
  return await this.findAll({
    where: { product_id: productId },
    order: [['created_at', 'DESC']],
    limit,
    include: [{
      model: sequelize.models.WarehouseOrder,
      as: 'order',
      attributes: ['supplier_name', 'order_date', 'status']
    }]
  });
};

module.exports = WarehouseOrderItem;
