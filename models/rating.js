'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Rating.belongsTo(models.Task, { foreignKey: 'taskId' });
      Rating.belongsTo(models.User, { as: 'From', foreignKey: 'fromUserId' });
      Rating.belongsTo(models.User, { as: 'To', foreignKey: 'toUserId' });

    }
  }
  Rating.init({
    taskId: DataTypes.INTEGER,
    fromUserId: DataTypes.INTEGER,
    toUserId: DataTypes.INTEGER,
    score: DataTypes.FLOAT,
    review: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Rating',
  });
  return Rating;
};