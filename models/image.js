const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const User = require('./user');
const Tag = require('./tag');
const ImageTag = require('./imageTag');

//schema for image
const Image = sequelize.define('image', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  caption: Sequelize.STRING,
});

module.exports = Image;
