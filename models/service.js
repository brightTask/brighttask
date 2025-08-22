'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Service.belongsToMany(models.Hustler, {
        through: 'HustlerService',
        foreignKey: 'serviceId',
        otherKey: 'hustlerId',
        as: 'serviceProviders'
      });

      Service.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
      Service.hasMany(models.Gig, { foreignKey: 'serviceId', as: 'gigs' });
      Service.belongsToMany(models.Post, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'service' }
        },
        foreignKey: 'relatedId',
        otherKey: 'postId',
        as: 'posts'
      });
    }
  }

  Service.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    priceUnit: DataTypes.STRING,
    order: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
    requirements: {
      type: DataTypes.JSON,
      allowNull: true
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    icon: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Service',
  });
  return Service;
};