const Sequelize = require('sequelize');

const sequelize = require('../util/database');

//schema for the many to many between followee and follower
const Following = sequelize.define(
  'following',
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['followingId', 'followeeId'],
      },
    ],
  }
);

module.exports = Following;
