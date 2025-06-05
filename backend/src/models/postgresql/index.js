const { sequelize } = require('../../config/database');

// Import models
const Product = require('./Product');
const CustomerOrder = require('./CustomerOrder');
const CustomerOrderItem = require('./CustomerOrderItem');
const WarehouseOrder = require('./WarehouseOrder');
const WarehouseOrderItem = require('./WarehouseOrderItem');
const Expense = require('./Expense');
const User = require('./User');
const SyncedOrder = require('./SyncedOrder');

/**
 * Initialize PostgreSQL models and their associations
 */

// Define associations
const initializeAssociations = () => {

  // CustomerOrder and CustomerOrderItem associations
  CustomerOrder.hasMany(CustomerOrderItem, {
    foreignKey: 'order_id',
    as: 'items',
    onDelete: 'CASCADE'
  });

  CustomerOrderItem.belongsTo(CustomerOrder, {
    foreignKey: 'order_id',
    as: 'order'
  });

  // Product and CustomerOrderItem associations
  Product.hasMany(CustomerOrderItem, {
    foreignKey: 'product_id',
    as: 'customer_order_items'
  });

  CustomerOrderItem.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // WarehouseOrder and WarehouseOrderItem associations
  WarehouseOrder.hasMany(WarehouseOrderItem, {
    foreignKey: 'order_id',
    as: 'items',
    onDelete: 'CASCADE'
  });

  WarehouseOrderItem.belongsTo(WarehouseOrder, {
    foreignKey: 'order_id',
    as: 'order'
  });

  // Product and WarehouseOrderItem associations
  Product.hasMany(WarehouseOrderItem, {
    foreignKey: 'product_id',
    as: 'warehouse_order_items'
  });

  WarehouseOrderItem.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // User and SyncedOrder associations
  User.hasMany(SyncedOrder, {
    foreignKey: 'user_id',
    as: 'synced_orders',
    onDelete: 'CASCADE'
  });

  SyncedOrder.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

// Initialize associations
initializeAssociations();

/**
 * Synchronize database (create tables if they don't exist)
 */
const syncDatabase = async (force = false) => {
  try {
    console.log('🔄 Starting database synchronization...');

    // Sync in correct order to handle foreign key dependencies
    await User.sync({ force });
    console.log('✅ User table synchronized');

    await Product.sync({ force });
    console.log('✅ Product table synchronized');

    await CustomerOrder.sync({ force });
    console.log('✅ CustomerOrder table synchronized');

    await CustomerOrderItem.sync({ force });
    console.log('✅ CustomerOrderItem table synchronized');

    await WarehouseOrder.sync({ force });
    console.log('✅ WarehouseOrder table synchronized');

    await WarehouseOrderItem.sync({ force });
    console.log('✅ WarehouseOrderItem table synchronized');

    await Expense.sync({ force });
    console.log('✅ Expense table synchronized');

    await SyncedOrder.sync({ force });
    console.log('✅ SyncedOrder table synchronized');

    console.log('🎉 Database synchronization completed successfully');

    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
    throw error;
  }
};

/**
 * Drop all tables (useful for development)
 */
const dropAllTables = async () => {
  try {
    console.log('🗑️ Dropping all tables...');

    // Drop in reverse order to handle foreign key dependencies
    await CustomerOrderItem.drop({ cascade: true });
    await WarehouseOrderItem.drop({ cascade: true });
    await CustomerOrder.drop({ cascade: true });
    await WarehouseOrder.drop({ cascade: true });
    await Product.drop({ cascade: true });
    await Expense.drop({ cascade: true });

    console.log('✅ All tables dropped successfully');
  } catch (error) {
    console.error('❌ Failed to drop tables:', error.message);
    throw error;
  }
};

/**
 * Get database information
 */
const getDatabaseInfo = async () => {
  try {
    const query = `
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name IN ('products', 'customer_orders', 'customer_order_items', 'warehouse_orders', 'warehouse_order_items', 'expenses')
      ORDER BY table_name, ordinal_position;
    `;

    const [results] = await sequelize.query(query);

    const tables = {};
    results.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        default: row.column_default
      });
    });

    return tables;
  } catch (error) {
    console.error('❌ Failed to get database info:', error.message);
    throw error;
  }
};

/**
 * Check database health
 */
const checkDatabaseHealth = async () => {
  try {
    await sequelize.authenticate();

    const tableChecks = await Promise.all([
      Product.count(),
      CustomerOrder.count(),
      CustomerOrderItem.count(),
      WarehouseOrder.count(),
      WarehouseOrderItem.count(),
      Expense.count()
    ]);

    return {
      connection: 'healthy',
      tables: {
        products: tableChecks[0],
        customer_orders: tableChecks[1],
        customer_order_items: tableChecks[2],
        warehouse_orders: tableChecks[3],
        warehouse_order_items: tableChecks[4],
        expenses: tableChecks[5]
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      connection: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Export models
module.exports = {
  sequelize,
  User,
  Product,
  CustomerOrder,
  CustomerOrderItem,
  WarehouseOrder,
  WarehouseOrderItem,
  Expense,
  SyncedOrder,
  syncDatabase,
  dropAllTables,
  getDatabaseInfo,
  checkDatabaseHealth
};
