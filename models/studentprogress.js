'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StudentProgress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StudentProgress.belongsTo(models.CourseClass, { foreignKey: 'classId', as: 'courseClass' });
      StudentProgress.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
    }
  }
  StudentProgress.init({
    classId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    isCompleted: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'StudentProgress',
  });
  return StudentProgress;
};