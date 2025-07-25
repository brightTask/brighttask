'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Gigs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
    clientId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    serviceId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    location: {
      type: Sequelize.STRING
    },
    note: {
      type: Sequelize.STRING
    },
    budgetMin: {
      type: Sequelize.DECIMAL
    },
    budgetMax: {
      type: Sequelize.DECIMAL
    },
    isRemote: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    hustlerId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    deadline: {
      type: Sequelize.DATE
    },
    requirements: {
      type: Sequelize.JSON
    },
    visibility: {
      type: Sequelize.ENUM('public', 'private'),
      defaultValue: 'public'
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
    await queryInterface.dropTable('Gigs');
  }
};