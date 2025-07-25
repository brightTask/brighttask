'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserAction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserAction.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    }
  }
  UserAction.init({
    postId: DataTypes.INTEGER,
    actionType: DataTypes.ENUM('Enroll', 'Request', 'Reach'),
    actionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserAction',
  });
  return UserAction;
};