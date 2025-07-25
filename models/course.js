'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Course.belongsTo(models.Hustler, { foreignKey: 'instructorId', as: 'instructor' });
      Course.hasMany(models.CourseReport, { foreignKey: 'courseId', as: 'reports' });
      Course.hasMany(models.Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
      Course.belongsToMany(models.User, {
        through: 'Enrollment',
        foreignKey: 'courseId',
        otherKey: 'studentId',
        as: 'students'
      });
      Course.belongsTo(models.CourseCategory, { foreignKey: 'categoryId', as: 'category' });
      Course.hasMany(models.CourseClass, { foreignKey: 'courseId', as: 'classes' });

      Course.hasMany(models.Certificate, { foreignKey: 'courseId', as: 'certificates' });
      Course.belongsToMany(models.CourseTag, {
        through: 'CourseTagMap',
        foreignKey: 'courseId',
        otherKey: 'tagId',
        as: 'tags'
      });
      Course.belongsToMany(models.Post, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'course' }
        },
        foreignKey: 'relatedId',
        otherKey: 'articleId',
        as: 'articles'
      });
    }
  }
  Course.init({
    instructorId: DataTypes.INTEGER,
    courseCode: DataTypes.STRING,
    image: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    categoryId: DataTypes.INTEGER,
    requirements: DataTypes.JSON,
    approved: DataTypes.BOOLEAN,
    verified: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};