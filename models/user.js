'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     */
    static associate(models) {
      // define association here  
      User.hasMany(models.Post, {
        foreignKey: 'userId',
        as: 'posts'
      });
      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments'
      });
      User.hasMany(models.Like, {
        foreignKey: 'user_id',
        as: 'likes'
      });
      User.hasMany(models.UserInteraction, {
        foreignKey: 'user_id',
        as: 'interactions'
      });

      // A user can refer many users
      User.hasMany(User, { foreignKey: 'referredBy', as: 'network' });

      // A user was referred by one user
      User.belongsTo(User, { foreignKey: 'referredBy', as: 'referrer' });

      User.hasMany(models.Follower, { as: 'Followers', foreignKey: 'followed_id' });
      User.hasMany(models.Follower, { as: 'Followings', foreignKey: 'follower_id' });

      User.hasMany(models.Notification, {
        foreignKey: 'target_id',
        as: 'receivedNotifications'
      });

      User.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'sentNotifications'
      });

      User.hasMany(models.Activity, {
        foreignKey: 'target_id',
        as: 'receivedActivities'
      });

      User.hasMany(models.Activity, {
        foreignKey: 'user_id',
        as: 'sentActivities'
      });
      User.hasOne(models.Wallet, { foreignKey: 'userId' });


      User.hasMany(models.Gig, { foreignKey: 'clientId' }); // client posted gigs
      User.hasMany(models.Rating, { foreignKey: 'fromUserId' });
      User.hasMany(models.Rating, { foreignKey: 'toUserId' });

      User.hasMany(models.Referral, { foreignKey: 'referrerId' });
      User.hasMany(models.Referral, { foreignKey: 'refereeId' });

      User.hasMany(models.Recharge, { foreignKey: 'userId' });
      User.hasMany(models.Withdrawal, { foreignKey: 'userId' });
      User.hasMany(models.Transaction, { foreignKey: 'userId' });

      User.hasMany(models.Report, { foreignKey: 'reportedById' });
      User.hasMany(models.Report, { foreignKey: 'targetUserId' });

      User.hasMany(models.Achievement, { foreignKey: 'userId' });
      User.hasMany(models.StudentProgress, {
        foreignKey: 'studentId',
        as: 'progress'
      });
      User.hasMany(models.Enrollment, {
        foreignKey: 'studentId',
        as: 'enrollments'
      });

      User.belongsToMany(models.Post, {
        through: models.postTag,   // join table
        foreignKey: 'userId',
        otherKey: 'postId',
      });


      User.hasOne(models.Hustler, { foreignKey: 'userId' });

    }
  }
  User.init({
    role: DataTypes.ENUM(
      'seniorAdmin',
      'admin',
      'hustler',
      'client'
    ),
    bio: DataTypes.TEXT,
    status: DataTypes.ENUM('active', 'inactive', 'banned'),
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },

    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    password: DataTypes.STRING,
    profile_pic: DataTypes.STRING,
    phone: DataTypes.STRING,
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tiktok: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtube: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referralCode: DataTypes.STRING,
    referredBy: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};