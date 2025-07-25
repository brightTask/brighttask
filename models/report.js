'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(models.User, { foreignKey: 'reportedById', as: 'Reporter' });
      Report.belongsTo(models.User, { foreignKey: 'targetUserId', as: 'TargetUser' });
    }
  }
  Report.init({
    reportedById: DataTypes.INTEGER,
    targetUserId: DataTypes.INTEGER,
    reason: DataTypes.STRING,
    details: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};