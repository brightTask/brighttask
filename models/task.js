'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      // Belongs to a specific step of the service
      Task.belongsTo(models.Hustler, {
        foreignKey: 'hustlerId',
        as: 'hustler'
      });



      // Belongs to an order
      Task.belongsTo(models.Gig, {
        foreignKey: 'gigId',
        as: 'gig'
      });
      // Has many payments
      Task.hasMany(models.Payment, {
        foreignKey: 'taskId',
        as: 'payments',
        constraints: false,
        scope: { taskType: 'task' }
      });
      
      Task.belongsToMany(models.Post, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'task' }
        },
        foreignKey: 'relatedId',
        otherKey: 'postId',
        as: 'posts'
      });

    }
  }

  Task.init({
    gigId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hustlerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      price: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 'pending', // optional default
      validate: {
        isIn: [['pending', 'in_progress', 'completed', 'cancelled']]
      }
    },
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'Tasks', // good for clarity
    timestamps: true
  });

  return Task;
};
