'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class postTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      postTag.belongsTo(models.User, { foreignKey: 'userId' });
      postTag.belongsTo(models.Post, { foreignKey: 'postId' });
    }
  }
  postTag.init({
    postId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'postTag',
  });
  return postTag;
};