'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PostRelation.init({
    postId: DataTypes.INTEGER,
    relatedType: {
      type: DataTypes.ENUM(
        'task',
        'gig',
        'post',
        'media',
        'course',
        'service',
        'achievement'
      ),
      allowNull: true,
    },
    relatedId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PostRelation',
  });
  return PostRelation;
};