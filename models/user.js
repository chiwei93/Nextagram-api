const Sequelize = require('sequelize');

const sequelize = require('../util/database');

//schema for users
const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  profileImage: {
    type: Sequelize.STRING,
    defaultValue:
      'https://pc-food-bucket.s3-ap-southeast-1.amazonaws.com/1619099339372',
  },
  resetToken: Sequelize.STRING,
  resetTokenExpiration: Sequelize.DATE,
});

module.exports = User;
