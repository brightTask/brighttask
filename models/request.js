'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    static associate(models) {
      // Belongs to a specific step of the service
      Request.belongsTo(models.Hustler, {
        foreignKey: 'hustlerId',
        as: 'hustler'
      });

      // Belongs to an order
      Request.belongsTo(models.Gig, {
        foreignKey: 'gigId',
        as: 'gig'
      });

    }
  }

  Request.init({
    gigId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hustlerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    note: {
      type: DataTypes.STRING,
    },
    
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'under-review', // optional default
      validate: {
        isIn: [['under-review', 'accepeted', 'rejected', 'cancelled']]
      }
    },
  }, {
    sequelize,
    modelName: 'Request',
    tableName: 'Requests', // good for clarity
    timestamps: true
  });

  return Request;
};
