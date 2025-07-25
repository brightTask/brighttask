'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Certificate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Certificate.belongsTo(models.Enrollment, {
        foreignKey: 'enrollmentId',
        as: 'enrollment'
      }

      )    }
  }
  Certificate.init({
    enrollmentId: DataTypes.INTEGER,
    issuedAt: DataTypes.DATE,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Certificate',
  });
  return Certificate;
};