const Sequelize = require('sequelize');

const sequelize = require('../util/database');

//schema for likes
const ImageLike = sequelize.define(
  'imageLike',
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
        fields: ['userId', 'imageId'],
      },
    ],
  }
);

module.exports = ImageLike;
