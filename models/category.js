'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Category.hasMany(models.Service, {
        foreignKey: 'categoryId',
        as: 'services'
      });

      Category.belongsTo(models.Category, { foreignKey: 'groupId', as: 'group' });

    }
  }
  Category.init({
    name: DataTypes.STRING,
    groupId: DataTypes.INTEGER,
    icon: DataTypes.STRING,
    description: DataTypes.STRING,
    order: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};