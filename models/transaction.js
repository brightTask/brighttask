'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.User, { foreignKey: 'userId' });
// optionally relate to recharge, withdrawal, or payment via typeId
      Transaction.belongsTo(models.Referral, { foreignKey: 'typeId', constraints: false, scope: { type: 'referral' } });
      Transaction.belongsTo(models.Recharge, { foreignKey: 'typeId', constraints: false, scope: { type: 'recharge' } });
      Transaction.belongsTo(models.Withdrawal, { foreignKey: 'typeId', constraints: false, scope: { type: 'withdrawal' } });
      Transaction.belongsTo(models.Payment, { foreignKey: 'typeId', constraints: false, scope: { type: 'payment' } });
    }
  }
  Transaction.init({
    userId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    typeId: DataTypes.INTEGER,
    direction: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    fee: DataTypes.FLOAT,
    netAmount: DataTypes.FLOAT,
    balanceBefore: DataTypes.FLOAT,
    balanceAfter: DataTypes.FLOAT,
    note: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};