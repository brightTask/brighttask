'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CourseTag.belongsToMany(models.Course, {
        through: 'CourseTagMap',
        foreignKey: 'tagId',
        otherKey: 'courseId',
        as: 'courses'
      });
    }
  }
  CourseTag.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CourseTag',
  });
  return CourseTag;
};