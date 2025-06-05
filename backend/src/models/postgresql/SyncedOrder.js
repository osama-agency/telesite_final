const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * SyncedOrder model for PostgreSQL database
 * Represents orders synced from external API for specific users
 */
const SyncedOrder = sequelize.define('SyncedOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  external_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: 'ID заказа из внешнего API'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'ID пользователя (админа), которому принадлежат данные'
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Дата оплаты заказа'
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID клиента из внешней системы'
  },
  full_name: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'ФИО клиента'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Адрес доставки'
  },
  shipping_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Стоимость доставки в лирах'
  },
  product_name: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Название товара'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Количество товара'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Цена товара в лирах'
  },
  external_created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата создания записи во внешней системе'
  },
  last_synced_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Время последней синхронизации'
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
  tableName: 'synced_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['external_order_id'], unique: true },
    { fields: ['paid_at'] },
    { fields: ['client_id'] },
    { fields: ['user_id', 'paid_at'] },
    { fields: ['last_synced_at'] }
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
SyncedOrder.prototype.toJSON = function() {
  const values = { ...this.get() };

  // Format decimal fields for JSON response
  if (values.shipping_cost) values.shipping_cost = parseFloat(values.shipping_cost);
  if (values.price) values.price = parseFloat(values.price);

  return values;
};

/**
 * Static methods
 */

/**
 * Find orders by user and date range
 */
SyncedOrder.findByUserAndDateRange = function(userId, startDate, endDate) {
  return this.findAll({
    where: {
      user_id: userId,
      paid_at: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      }
    },
    order: [['paid_at', 'DESC']]
  });
};

/**
 * Find orders by user for today
 */
SyncedOrder.findTodayOrdersByUser = function(userId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  return this.findByUserAndDateRange(userId, startOfDay, endOfDay);
};

/**
 * Bulk upsert orders from external API
 */
SyncedOrder.bulkUpsertFromExternalApi = async function(ordersData, userId) {
  const transaction = await sequelize.transaction();

  try {
    const upsertPromises = ordersData.map(order => {
      return this.upsert({
        external_order_id: order.id,
        user_id: userId,
        paid_at: new Date(order.created_at || order.paid_at),
        client_id: order.client_id || order.id,
        full_name: order.full_name || `Клиент ${order.id}`,
        address: order.address || 'Адрес не указан',
        shipping_cost: order.shipping_cost || 0,
        product_name: order.product_name || order.name || 'Товар не указан',
        quantity: order.quantity || order.qty || 1,
        price: order.price || 0,
        external_created_at: order.created_at ? new Date(order.created_at) : null,
        last_synced_at: new Date()
      }, {
        transaction,
        returning: true
      });
    });

    const results = await Promise.all(upsertPromises);
    await transaction.commit();

    return results;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get statistics for user
 */
SyncedOrder.getStatisticsByUser = async function(userId, dateFrom = null, dateTo = null) {
  const whereClause = { user_id: userId };

  if (dateFrom && dateTo) {
    whereClause.paid_at = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const stats = await this.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders'],
      [sequelize.fn('SUM', sequelize.col('price')), 'total_revenue'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'total_items'],
      [sequelize.fn('SUM', sequelize.col('shipping_cost')), 'total_shipping']
    ],
    where: whereClause,
    raw: true
  });

  return stats[0];
};

module.exports = SyncedOrder;
