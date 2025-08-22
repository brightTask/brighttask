'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      Payment.hasMany(models.Transaction, { foreignKey: 'typeId', scope: { type: 'payment' } });
      Payment.belongsTo(models.Course, { foreignKey: 'taskId', as: 'course', constraints: false, scope: { taskType: 'course' } });
      Payment.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task', constraints: false, scope: { taskType: 'task' } });
    }
  }

  Payment.init({
    taskType: DataTypes.ENUM('task', 'course'),
    taskId: DataTypes.INTEGER,
    amount: DataTypes.FLOAT,
    fee: DataTypes.FLOAT,
    netAmount: DataTypes.FLOAT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};