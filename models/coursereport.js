'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseReport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CourseReport.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
      CourseReport.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
    }
  }
  CourseReport.init({
    courseId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    reason: DataTypes.TEXT,
    evidence: DataTypes.JSON,
    status: DataTypes.ENUM('pending', 'resolved', 'rejected')
  }, {
    sequelize,
    modelName: 'CourseReport',
  });
  return CourseReport;
};