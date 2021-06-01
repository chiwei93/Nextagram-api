const Sequelize = require('sequelize');

const sequelize = require('../util/database');

//schema for the many to many relationship between images and tags
const ImageTag = sequelize.define(
  'imageTag',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    indexes: [{ unique: true, fields: ['imageId', 'tagId'] }],
  }
);

module.exports = ImageTag;
