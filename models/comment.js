'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Comment.belongsTo(models.Post, {
        foreignKey: 'post_id',
        as: 'post'
      });
      Comment.belongsTo(Comment, {
        foreignKey: 'parent_comment_id',
        as: 'parent'
      });
      Comment.hasMany(Comment, {
        foreignKey: 'parent_comment_id',
        as: 'replies'
      });
      Comment.hasMany(models.Like, {
        foreignKey: 'likeable_id',
        constraints: false,
        scope: {
          likeable_type: 'Comment'
        },
        as: 'likes'
      });
    }
  }
  Comment.init({
    user_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER,
    parent_comment_id: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    is_approved: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};