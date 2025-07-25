'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HustlerServices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hustlerId: {
        type: Sequelize.INTEGER
      },
      serviceId: {
        type: Sequelize.INTEGER
      },     
      
    requirements: {
      type: Sequelize.JSON,
      allowNull: true
    }, 
      available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: false
      },
        service_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.dropTable('HustlerServices');
  }
};