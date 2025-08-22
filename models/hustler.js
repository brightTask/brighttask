'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hustler extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Hustler.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });

      Hustler.belongsToMany(models.Service, {
        through: 'HustlerService',
        foreignKey: 'hustlerId',
        otherKey: 'serviceId',
        as: 'services'
      });
      Hustler.hasMany(models.Task, { foreignKey: 'hustlerId', as: 'tasks' });
      Hustler.hasMany(models.Request, { foreignKey: 'hustlerId' });
      Hustler.hasMany(models.Course, { foreignKey: 'instructorId', as: 'courses' });
    }
  }
  Hustler.init({
    userId: DataTypes.INTEGER,
    bio: DataTypes.TEXT,
    isVerified: DataTypes.BOOLEAN,
    skills: DataTypes.JSON,
    portfolioUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },

    location: DataTypes.STRING,
    rating: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Hustler',
  });
  return Hustler;
};