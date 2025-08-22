'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Withdrawal extends Model {
    
    static associate(models) {
      // define association here
      Withdrawal.belongsTo(models.User, { foreignKey: 'userId' });
      Withdrawal.hasMany(models.Transaction, { foreignKey: 'typeId', scope: { type: 'withdrawal' } });
    }
  }
  Withdrawal.init({
    userId: DataTypes.INTEGER,
    method: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    fee: DataTypes.FLOAT,
    netAmount: DataTypes.FLOAT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Withdrawal',
  });
  return Withdrawal;
};