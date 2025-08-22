'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Referral extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Referral.belongsTo(models.User, { foreignKey: 'referrerId', as: 'Referrer' });
      Referral.belongsTo(models.User, { foreignKey: 'refereeId', as: 'Referee' });
      Referral.hasOne(models.Transaction, { foreignKey: 'typeId', scope: { type: 'referral' } });

    }
  }
  
  Referral.init({
    referrerId: DataTypes.INTEGER,
    refereeId: DataTypes.INTEGER,
    rewardAmount: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Referral',
  });
  return Referral;
};