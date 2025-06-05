const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * Expense model for PostgreSQL database
 * Represents business expenses and costs
 */
const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: { msg: 'Date must be a valid date' }
    }
  },
  category: {
    type: DataTypes.ENUM(
      'Аренда', 'Коммунальные услуги', 'Зарплата', 'Маркетинг',
      'Транспорт', 'Оборудование', 'Материалы', 'Услуги',
      'Налоги', 'Страхование', 'Интернет', 'Телефон', 'Прочее'
    ),
    allowNull: false,
    validate: {
      isIn: {
        args: [[
          'Аренда', 'Коммунальные услуги', 'Зарплата', 'Маркетинг',
          'Транспорт', 'Оборудование', 'Материалы', 'Услуги',
          'Налоги', 'Страхование', 'Интернет', 'Телефон', 'Прочее'
        ]],
        msg: 'Invalid expense category'
      }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Amount must be a positive number' },
      isDecimal: { msg: 'Amount must be a valid decimal number' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
      len: { args: [1, 1000], msg: 'Description must be between 1 and 1000 characters' }
    }
  },
  vendor: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: { args: [0, 255], msg: 'Vendor name cannot exceed 255 characters' }
    }
  },
  reference_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: { args: [0, 100], msg: 'Reference number cannot exceed 100 characters' }
    }
  },
  payment_method: {
    type: DataTypes.ENUM('Наличные', 'Банковский перевод', 'Карта', 'Чек', 'Прочее'),
    allowNull: true,
    validate: {
      isIn: {
        args: [['Наличные', 'Банковский перевод', 'Карта', 'Чек', 'Прочее']],
        msg: 'Invalid payment method'
      }
    }
  },
  tax_deductible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  receipt_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: { msg: 'Receipt URL must be a valid URL' }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 1000], msg: 'Notes cannot exceed 1000 characters' }
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
  tableName: 'expenses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['date'] },
    { fields: ['category'] },
    { fields: ['vendor'] },
    { fields: ['payment_method'] },
    { fields: ['tax_deductible'] },
    { fields: ['created_at'] },
    { fields: ['date', 'category'] }
  ],
  hooks: {
    beforeUpdate: (expense) => {
      expense.updated_at = new Date();
    }
  }
});

/**
 * Instance methods
 */
Expense.prototype.toJSON = function() {
  const values = { ...this.get() };

  // Format decimal fields for JSON response
  if (values.amount) values.amount = parseFloat(values.amount);

  return values;
};

/**
 * Check if expense is tax deductible
 */
Expense.prototype.isTaxDeductible = function() {
  return this.tax_deductible;
};

/**
 * Get formatted amount with currency
 */
Expense.prototype.getFormattedAmount = function(currency = '₽') {
  return `${parseFloat(this.amount).toLocaleString('ru-RU')} ${currency}`;
};

/**
 * Check if expense is recent (within last 30 days)
 */
Expense.prototype.isRecent = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return new Date(this.date) >= cutoffDate;
};

/**
 * Static methods
 */

/**
 * Find expenses by category
 */
Expense.findByCategory = function(category) {
  return this.findAll({
    where: { category },
    order: [['date', 'DESC']]
  });
};

/**
 * Find expenses by date range
 */
Expense.findByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      date: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      }
    },
    order: [['date', 'DESC']]
  });
};

/**
 * Find tax deductible expenses
 */
Expense.findTaxDeductible = function(dateFrom = null, dateTo = null) {
  const whereClause = { tax_deductible: true };

  if (dateFrom && dateTo) {
    whereClause.date = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  return this.findAll({
    where: whereClause,
    order: [['date', 'DESC']]
  });
};

/**
 * Get total expenses by category
 */
Expense.getTotalByCategory = async function(dateFrom = null, dateTo = null) {
  const whereClause = {};

  if (dateFrom && dateTo) {
    whereClause.date = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const result = await this.findAll({
    attributes: [
      'category',
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: whereClause,
    group: ['category'],
    raw: true
  });

  return result.map(item => ({
    category: item.category,
    total_amount: parseFloat(item.total_amount),
    count: parseInt(item.count)
  }));
};

/**
 * Get monthly expense totals
 */
Expense.getMonthlyTotals = async function(year = null) {
  const whereClause = {};

  if (year) {
    whereClause.date = {
      [sequelize.Sequelize.Op.between]: [
        new Date(`${year}-01-01`),
        new Date(`${year}-12-31`)
      ]
    };
  }

  const result = await this.findAll({
    attributes: [
      [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM date')), 'year'],
      [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date')), 'month'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: whereClause,
    group: [
      sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM date')),
      sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date'))
    ],
    order: [
      [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM date')), 'ASC'],
      [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date')), 'ASC']
    ],
    raw: true
  });

  return result.map(item => ({
    year: parseInt(item.year),
    month: parseInt(item.month),
    total_amount: parseFloat(item.total_amount),
    count: parseInt(item.count)
  }));
};

/**
 * Get total expenses for a period
 */
Expense.getTotalForPeriod = async function(dateFrom, dateTo) {
  const result = await this.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      date: {
        [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
      }
    },
    raw: true
  });

  return {
    total_amount: parseFloat(result.total_amount) || 0,
    count: parseInt(result.count) || 0
  };
};

/**
 * Get expense statistics
 */
Expense.getStatistics = async function(dateFrom = null, dateTo = null) {
  const whereClause = {};

  if (dateFrom && dateTo) {
    whereClause.date = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const result = await this.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
      [sequelize.fn('AVG', sequelize.col('amount')), 'average_amount'],
      [sequelize.fn('MIN', sequelize.col('amount')), 'min_amount'],
      [sequelize.fn('MAX', sequelize.col('amount')), 'max_amount'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: whereClause,
    raw: true
  });

  return {
    total_amount: parseFloat(result.total_amount) || 0,
    average_amount: parseFloat(result.average_amount) || 0,
    min_amount: parseFloat(result.min_amount) || 0,
    max_amount: parseFloat(result.max_amount) || 0,
    count: parseInt(result.count) || 0
  };
};

/**
 * Search expenses by description or vendor
 */
Expense.search = function(query) {
  return this.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        {
          description: {
            [sequelize.Sequelize.Op.iLike]: `%${query}%`
          }
        },
        {
          vendor: {
            [sequelize.Sequelize.Op.iLike]: `%${query}%`
          }
        }
      ]
    },
    order: [['date', 'DESC']]
  });
};

/**
 * Get top vendors by expense amount
 */
Expense.getTopVendors = async function(limit = 10, dateFrom = null, dateTo = null) {
  const whereClause = {
    vendor: {
      [sequelize.Sequelize.Op.not]: null
    }
  };

  if (dateFrom && dateTo) {
    whereClause.date = {
      [sequelize.Sequelize.Op.between]: [dateFrom, dateTo]
    };
  }

  const result = await this.findAll({
    attributes: [
      'vendor',
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: whereClause,
    group: ['vendor'],
    order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
    limit,
    raw: true
  });

  return result.map(item => ({
    vendor: item.vendor,
    total_amount: parseFloat(item.total_amount),
    count: parseInt(item.count)
  }));
};

module.exports = Expense;
