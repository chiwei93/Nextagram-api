require('dotenv').config();

const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const createError = require('../util/errors');
const User = require('../models/user');

//middleware for checking if user is authenticated or not
module.exports = async (req, res, next) => {
  if (!req.get('Authorization')) {
    const error = createError('User not authenticated.', 401);
    return next(error);
  }

  //get token
  const token = req.get('Authorization').split(' ')[1];

  try {
    //verify token
    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    //if invalid token
    if (!decodedToken) {
      const error = createError('User not authenticated.', 401);
      throw error;
    }

    const user = await User.findByPk(decodedToken.id);

    if (!user) {
      const error = createError('User not authenticated', 401);
      throw error;
    }

    //place userid and email on req object
    req.userId = decodedToken.id;
    req.email = decodedToken.email;
    req.user = user;
    next();
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
