const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * WarehouseOrder model for PostgreSQL database
 * Represents warehouse/supplier orders for inventory restocking
 */
const WarehouseOrder = sequelize.define('WarehouseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  supplier_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Supplier name is required' },
      len: { args: [1, 255], msg: 'Supplier name must be between 1 and 255 characters' }
    }
  },
  supplier_contact: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Supplier contact is required' },
      len: { args: [1, 255], msg: 'Supplier contact must be between 1 and 255 characters' }
    }
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: { msg: 'Order date must be a valid date' }
    }
  },
  expected_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'Expected delivery date must be a valid date' }
    }
  },
  actual_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'Actual delivery date must be a valid date' }
    }
  },
  status: {
    type: DataTypes.ENUM('Ожидается', 'Получено', 'Отменено'),
    allowNull: false,
    defaultValue: 'Ожидается',
    validate: {
      isIn: {
        args: [['Ожидается', 'Получено', 'Отменено']],
        msg: 'Invalid warehouse order status'
      }
    }
  },
  total_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: { args: [0], msg: 'Total cost must be a positive number' },
      isDecimal: { msg: 'Total cost must be a valid decimal number' }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 2000], msg: 'Notes cannot exceed 2000 characters' }
    }
  },
  invoice_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: { args: [0, 100], msg: 'Invoice number cannot exceed 100 characters' }
    }
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: { args: [0, 100], msg: 'Tracking number cannot exceed 100 characters' }
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
  tableName: 'warehouse_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['supplier_name'] },
    { fields: ['status'] },
    { fields: ['order_date'] },
    { fields: ['expected_delivery_date'] },
    { fields: ['invoice_number'] },
    { fields: ['created_at'] }
  ],
  hooks: {
    beforeUpdate: (order) => {
      order.updated_at = new Date();
    }
  }
});

/**
 * Instance methods
 */
WarehouseOrder.prototype.toJSON = function() {
  const values = { ...this.get() };

  // Format decimal fields for JSON response
  if (values.total_cost) values.total_cost = parseFloat(values.total_cost);

  return values;
};

/**
 * Check if order can be cancelled
 */
WarehouseOrder.prototype.canBeCancelled = function() {
  return this.status === 'Ожидается';
};

/**
 * Check if order is completed (received)
 */
WarehouseOrder.prototype.isCompleted = function() {
  return this.status === 'Получено';
};

/**
 * Check if order is cancelled
 */
WarehouseOrder.prototype.isCancelled = function() {
  return this.status === 'Отменено';
};

/**
 * Check if order is overdue
 */
WarehouseOrder.prototype.isOverdue = function() {
  if (!this.expected_delivery_date || this.status !== 'Ожидается') {
    return false;
  }

  const today = new Date();
  const expectedDate = new Date(this.expected_delivery_date);

  return today > expectedDate;
};

/**
 * Mark order as received and update stock
 */
WarehouseOrder.prototype.markAsReceived = async function(actualDeliveryDate = null) {
  if (this.status !== 'Ожидается') {
    throw new Error('Only pending orders can be marked as received');
  }

  const transaction = await sequelize.transaction();

  try {
    // Update order status
    this.status = 'Получено';
    this.actual_delivery_date = actualDeliveryDate || new Date();
    await this.save({ transaction });

    // Update product stock quantities
    const WarehouseOrderItem = sequelize.models.WarehouseOrderItem;
    const Product = sequelize.models.Product;

    const orderItems = await WarehouseOrderItem.findAll({
      where: { order_id: this.id },
      transaction
    });

    for (const item of orderItems) {
      const product = await Product.findByPk(item.product_id, { transaction });
      if (product) {
        product.quantity_in_stock += item.quantity;
        await product.save({ transaction });
      }
    }

    await transaction.commit();
    return this;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Update order status
 */
WarehouseOrder.prototype.updateStatus = async function(newStatus) {
  const validStatuses = ['Ожидается', 'Получено', 'Отменено'];

  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status');
  }

  this.status = newStatus;
  this.updated_at = new Date();

  return await this.save();
};

/**
 * Calculate total from order items
 */
WarehouseOrder.prototype.calculateTotal = async function() {
  const WarehouseOrderItem = sequelize.models.WarehouseOrderItem;

  const items = await WarehouseOrderItem.findAll({
    where: { order_id: this.id }
  });

  const total = items.reduce((sum, item) => {
    return sum + parseFloat(item.total_cost);
  }, 0);

  this.total_cost = total;
  return await this.save();
};

/**
 * Static methods
 */

/**
 * Find orders by status
 */
WarehouseOrder.findByStatus = function(status) {
  return this.findAll({
    where: { status },
    order: [['created_at', 'DESC']]
  });
};

/**
 * Find orders by supplier
 */
WarehouseOrder.findBySupplier = function(supplierName) {
  return this.findAll({
    where: {
      supplier_name: {
        [sequelize.Sequelize.Op.iLike]: `%${supplierName}%`
      }
    },
    order: [['created_at', 'DESC']]
  });
};

/**
 * Find overdue orders
 */
WarehouseOrder.findOverdue = function() {
  const today = new Date();

  return this.findAll({
    where: {
      status: 'Ожидается',
      expected_delivery_date: {
        [sequelize.Sequelize.Op.lt]: today
      }
    },
    order: [['expected_delivery_date', 'ASC']]
  });
};

/**
 * Find orders by date range
 */
WarehouseOrder.findByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      order_date: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      }
    },
    order: [['order_date', 'DESC']]
  });
};

/**
 * Get order statistics
 */
WarehouseOrder.getStatistics = async function(dateFrom, dateTo) {
  const whereClause = {};

  if (dateFrom && dateTo) {
    whereClause.order_date = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const stats = await this.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('total_cost')), 'total_cost']
    ],
    where: whereClause,
    group: ['status'],
    raw: true
  });

  return stats;
};

/**
 * Get delivery performance statistics
 */
WarehouseOrder.getDeliveryPerformance = async function(dateFrom, dateTo) {
  const whereClause = {
    status: 'Получено',
    expected_delivery_date: {
      [sequelize.Sequelize.Op.not]: null
    },
    actual_delivery_date: {
      [sequelize.Sequelize.Op.not]: null
    }
  };

  if (dateFrom && dateTo) {
    whereClause.actual_delivery_date = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const orders = await this.findAll({
    where: whereClause,
    raw: true
  });

  let onTime = 0;
  let late = 0;
  let early = 0;

  orders.forEach(order => {
    const expected = new Date(order.expected_delivery_date);
    const actual = new Date(order.actual_delivery_date);

    if (actual.toDateString() === expected.toDateString()) {
      onTime++;
    } else if (actual > expected) {
      late++;
    } else {
      early++;
    }
  });

  return {
    total: orders.length,
    onTime,
    late,
    early,
    onTimePercentage: orders.length > 0 ? ((onTime / orders.length) * 100).toFixed(2) : 0
  };
};

module.exports = WarehouseOrder;
