'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseClass extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CourseClass.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
      CourseClass.hasMany(models.Payment, {
        foreignKey: 'taskId',
        as: 'payments',
        constraints: false,
        scope: { taskType: 'course' }
      });
      CourseClass.hasMany(models.StudentProgress, {
        foreignKey: 'classId',
        as: 'studentProgress'
      });
    }
  }
  CourseClass.init({
    courseId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    duration: DataTypes.INTEGER,
    materials: DataTypes.JSON,
    price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'CourseClass',
  });
  return CourseClass;
};