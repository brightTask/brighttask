'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recharge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Recharge.belongsTo(models.User, { foreignKey: 'userId' });
      Recharge.hasMany(models.Transaction, { foreignKey: 'typeId', scope: { type: 'recharge' } });
    }
  }
  Recharge.init({
    userId: DataTypes.INTEGER,
    method: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    fee: DataTypes.FLOAT,
    netAmount: DataTypes.FLOAT,
    reference: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Recharge',
  });
  return Recharge;
};