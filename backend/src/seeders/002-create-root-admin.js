'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate bcrypt hash for password 'sfera13'
    const passwordHash = await bcrypt.hash('sfera13', 10);

    await queryInterface.bulkInsert('users', [{
      email: 'go@osama.agency',
      password_hash: passwordHash,
      name: 'Root Admin',
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'go@osama.agency'
    });
  }
};
