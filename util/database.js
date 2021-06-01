require('dotenv').config();

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  'nextagram',
  'root',
  process.env.DATABASE_PASSWORD,
  {
    dialect: 'mysql',
    host: 'localhost',
  }
);

module.exports = sequelize;
