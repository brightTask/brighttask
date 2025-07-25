'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      profile_pic: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING
      },
      bio: {
        type: Sequelize.TEXT
      },
      role: {
        type: Sequelize.ENUM(
          'seniorAdmin',
          'admin',
          'hustler',
          'client'
        ),
        defaultValue: 'client'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'banned'),
        defaultValue: 'active'
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
    phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    lastLogin: {
      type: Sequelize.DATE,
      allowNull: true
    },
    facebook: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    twitter: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    instagram: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    linkedin: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    tiktok: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    youtube: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    referralCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    referredBy: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('Users');
  }
};