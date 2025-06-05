'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('synced_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      external_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'ID заказа из внешнего API'
      },
      user_id: {
        type: Sequelize.INTEGER,
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
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Дата оплаты заказа'
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID клиента из внешней системы'
      },
      full_name: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'ФИО клиента'
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Адрес доставки'
      },
      shipping_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Стоимость доставки в лирах'
      },
      product_name: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Название товара'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Количество товара'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Цена товара в лирах'
      },
      external_created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Дата создания записи во внешней системе'
      },
      last_synced_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Время последней синхронизации'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('synced_orders', ['user_id'], {
      name: 'synced_orders_user_id_idx'
    });

    await queryInterface.addIndex('synced_orders', ['external_order_id'], {
      name: 'synced_orders_external_order_id_idx',
      unique: true
    });

    await queryInterface.addIndex('synced_orders', ['paid_at'], {
      name: 'synced_orders_paid_at_idx'
    });

    await queryInterface.addIndex('synced_orders', ['client_id'], {
      name: 'synced_orders_client_id_idx'
    });

    await queryInterface.addIndex('synced_orders', ['user_id', 'paid_at'], {
      name: 'synced_orders_user_paid_at_idx'
    });

    await queryInterface.addIndex('synced_orders', ['last_synced_at'], {
      name: 'synced_orders_last_synced_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('synced_orders');
  }
};
