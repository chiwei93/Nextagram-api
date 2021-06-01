const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const User = require('./user');
const Image = require('./image');

//schema for comment
const Comment = sequelize.define('comment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  comment: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Comment;
