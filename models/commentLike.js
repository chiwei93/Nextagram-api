const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const CommentLike = sequelize.define(
  'commentLike',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'commentId'],
      },
    ],
  }
);

module.exports = CommentLike;
