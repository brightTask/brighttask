'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, {
        as: 'Source',
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
    
      Notification.belongsTo(models.User, {
        as: 'Target',
        foreignKey: 'target_id',
        onDelete: 'CASCADE'
      });
      
  }}

  Notification.init(
    {
      type: {
        type: DataTypes.ENUM('like', 'comment', 'reply', 'follow', 'mention', 'task', 'success', 'failed', 'warning', 'danger', 'tag', 'other'),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      item_id: DataTypes.INTEGER,
      user_id: DataTypes.UUID,
      target_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'Notifications',
      timestamps: true,
    }
  );

  return Notification;
};
