const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * CustomerOrder model for PostgreSQL database
 * Represents customer orders in the system
 */
const CustomerOrder = sequelize.define('CustomerOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer name is required' },
      len: { args: [1, 255], msg: 'Customer name must be between 1 and 255 characters' }
    }
  },
  customer_contact: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer contact is required' },
      len: { args: [1, 255], msg: 'Customer contact must be between 1 and 255 characters' }
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
  status: {
    type: DataTypes.ENUM('Новый', 'Оплачен', 'Доставлен', 'Отменён'),
    allowNull: false,
    defaultValue: 'Новый',
    validate: {
      isIn: {
        args: [['Новый', 'Оплачен', 'Доставлен', 'Отменён']],
        msg: 'Invalid order status'
      }
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: { args: [0], msg: 'Total amount must be a positive number' },
      isDecimal: { msg: 'Total amount must be a valid decimal number' }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 2000], msg: 'Notes cannot exceed 2000 characters' }
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
  tableName: 'customer_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['customer_name'] },
    { fields: ['status'] },
    { fields: ['order_date'] },
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
CustomerOrder.prototype.toJSON = function() {
  const values = { ...this.get() };

  // Format decimal fields for JSON response
  if (values.total_amount) values.total_amount = parseFloat(values.total_amount);

  return values;
};

/**
 * Check if order can be cancelled
 */
CustomerOrder.prototype.canBeCancelled = function() {
  return ['Новый', 'Оплачен'].includes(this.status);
};

/**
 * Check if order is completed
 */
CustomerOrder.prototype.isCompleted = function() {
  return this.status === 'Доставлен';
};

/**
 * Check if order is cancelled
 */
CustomerOrder.prototype.isCancelled = function() {
  return this.status === 'Отменён';
};

/**
 * Update order status
 */
CustomerOrder.prototype.updateStatus = async function(newStatus) {
  const validStatuses = ['Новый', 'Оплачен', 'Доставлен', 'Отменён'];

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
CustomerOrder.prototype.calculateTotal = async function() {
  const CustomerOrderItem = sequelize.models.CustomerOrderItem;

  const items = await CustomerOrderItem.findAll({
    where: { order_id: this.id }
  });

  const total = items.reduce((sum, item) => {
    return sum + parseFloat(item.total_price);
  }, 0);

  this.total_amount = total;
  return await this.save();
};

/**
 * Static methods
 */

/**
 * Find orders by status
 */
CustomerOrder.findByStatus = function(status) {
  return this.findAll({
    where: { status },
    order: [['created_at', 'DESC']]
  });
};

/**
 * Find orders by date range
 */
CustomerOrder.findByDateRange = function(startDate, endDate) {
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
CustomerOrder.getStatistics = async function(dateFrom, dateTo) {
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
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
    ],
    where: whereClause,
    group: ['status'],
    raw: true
  });

  return stats;
};

/**
 * Search orders by customer name
 */
CustomerOrder.searchByCustomer = function(customerName) {
  return this.findAll({
    where: {
      customer_name: {
        [sequelize.Sequelize.Op.iLike]: `%${customerName}%`
      }
    },
    order: [['created_at', 'DESC']]
  });
};

module.exports = CustomerOrder;
