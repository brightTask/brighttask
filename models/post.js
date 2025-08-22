'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
      // An Post can have many comments
      // Each comment belongs to an Post
      Post.hasMany(models.Comment, { foreignKey: 'post_id', as: 'comments' });
      // An Post can have many likes
      // Each like belongs to an Post
      Post.hasMany(models.Like, {
        foreignKey: 'likeable_id',
        constraints: false,
        scope: {
          likeable_type: 'Post'
        },
        as: 'likes'
      });
      Post.hasMany(models.PostRelation, {
        foreignKey: 'postId',
        as: 'relations',
      });

      Post.belongsToMany(models.User, {
        through: models.postTag,   // join table
        foreignKey: 'postId',
        otherKey: 'userId',
        as: 'tags'
      });

      // To associate with other Posts
      Post.belongsToMany(models.Post, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'post' }
        },
        foreignKey: 'postId',
        otherKey: 'relatedId',
        as: 'sharedPost'
      });


      // Associate with Task
      Post.belongsToMany(models.Task, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'task' }
        },
        foreignKey: 'postId',
        otherKey: 'relatedId',
        as: 'task'
      });

      // Associate with Gig
      Post.belongsToMany(models.Gig, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'gig' }
        },
        foreignKey: 'postId',
        otherKey: 'relatedId',
        as: 'gig'
      });

      // Media
      Post.belongsToMany(models.Media, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'media' }
        },
        foreignKey: 'postId',
        otherKey: 'relatedId',
        as: 'media'
      });

      // Course
      Post.belongsToMany(models.Course, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'course' }
        },
        foreignKey: 'postId',
        otherKey: 'relatedId',
        as: 'course'
      });

      // Service
      Post.belongsToMany(models.Service, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'service' }
        },
        foreignKey: 'postId',
        otherKey: 'relatedId',
        as: 'service'
      });

      // Achievement
      Post.belongsToMany(models.Achievement, {
        through: {
          model: models.PostRelation,
          unique: false,
          scope: { relatedType: 'achievement' }
        },
        foreignKey: 'postId',
        otherKey: 'relatedId',
        as: 'achievement'
      });
      // An Post can have many user interactions
      // Each interaction belongs to an Post
      Post.hasMany(models.UserInteraction, { foreignKey: 'post_id', as: 'interactions' });


    }
  }
  Post.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT('long'),
    sponsored: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER,
    status: DataTypes.ENUM('posted', 'draft')
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};