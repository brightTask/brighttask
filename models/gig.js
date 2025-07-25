'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Gig extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Gig.belongsTo(models.User, { as: 'Client', foreignKey: 'clientId' });
      Gig.belongsTo(models.Service, { as: 'service', foreignKey: 'serviceId' });

      Gig.hasOne(models.Task, { as: 'task', foreignKey: 'gigId' });
      Gig.hasMany(models.Request, { foreignKey: 'gigId' });
      Gig.belongsToMany(models.Post, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'gig' }
        },
        foreignKey: 'relatedId',
        otherKey: 'postId',
        as: 'posts'
      });

    }
  }
  Gig.init({
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hustlerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true
    },
    budgetMin: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    budgetMax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    isRemote: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private'),
      defaultValue: 'public'
    }
  }, {
    sequelize,
    modelName: 'Gig',
  });
  return Gig;
};