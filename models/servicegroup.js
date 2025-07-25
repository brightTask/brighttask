'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServiceGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ServiceGroup.hasMany(models.Category , {foreignKey: 'groupId', as: 'categories'});
    }
  }
  ServiceGroup.init({
    name: DataTypes.STRING,
    order: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ServiceGroup',
  });
  return ServiceGroup;
};