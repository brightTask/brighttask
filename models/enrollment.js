'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Enrollment.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
      Enrollment.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
      Enrollment.hasOne(models.Certificate, { foreignKey: 'enrollmentId', as: 'certificate' });
    }
  }
  Enrollment.init({
    courseId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    status: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
    completedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Enrollment',
  });
  return Enrollment;
};