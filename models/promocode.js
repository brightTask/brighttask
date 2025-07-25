'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PromoCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PromoCode.belongsTo(models.User, { foreignKey: 'userId' });
      
    }
  }
  PromoCode.init({
    code: DataTypes.STRING,
    type: DataTypes.STRING,
    value: DataTypes.FLOAT,
    usageLimit: DataTypes.INTEGER,
    expiry: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PromoCode',
  });
  return PromoCode;
};