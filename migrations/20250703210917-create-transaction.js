'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      typeId: {
        type: Sequelize.INTEGER
      },
      direction: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.FLOAT
      },
      fee: {
        type: Sequelize.FLOAT
      },
      netAmount: {
        type: Sequelize.FLOAT
      },
      balanceBefore: {
        type: Sequelize.FLOAT
      },
      balanceAfter: {
        type: Sequelize.FLOAT
      },
      note: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};