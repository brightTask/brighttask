'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HustlerService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  HustlerService.init({
    service_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true
    },
    hustlerId: DataTypes.INTEGER,
    serviceId: DataTypes.INTEGER,
    available: DataTypes.BOOLEAN,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'HustlerService',
  });
  return HustlerService;
};