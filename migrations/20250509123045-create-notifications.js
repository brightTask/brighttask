'use strict';

const { all } = require("axios");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('like', 'comment', 'reply', 'follow', 'mention', 'task', 'success', 'failed', 'warning', 'danger', 'tag', 'other'),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false, // Title is required for notifications
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // Default value for `isRead`
      },
      // Foreign keys for associations
      user_id: {
        allowNull: true, // Allow null for user_id to support notifications without a source user
        type: Sequelize.UUID,
      },
      target_id: {
        type: Sequelize.UUID,
      },
      item_id: {
        type: Sequelize.INTEGER, // This can be used to reference the item related to the notification
      },
      // Timestamps for created and updated records
      // These fields will automatically be managed by Sequelize
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'), // Automatically set the creation time
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'), // Automatically set the update time
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  },
};
