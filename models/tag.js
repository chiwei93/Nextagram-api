const Sequelize = require('sequelize');

const sequelize = require('../util/database');

//schema for hash tags
const Tag = sequelize.define('tag', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  tag: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Tag;
