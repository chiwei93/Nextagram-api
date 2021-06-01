require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { promisify } = require('util');
const { Op } = require('sequelize');

const User = require('../models/user');
const createError = require('../util/errors');
const emailTransporter = require('../util/email');

//handling signup
exports.postSignup = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);

  //validation check
  if (!errors.isEmpty()) {
    const errorsArr = errors.array().map(e => e.msg);

    const error = createError('Validation Result', 422, errorsArr);

    return next(error);
  }

  try {
    //check if user existed already
    const user = await User.findOne({ where: { email } });

    //if user existed, throw error
    if (user) {
      const error = createError('Email already taken.', 400);
      throw error;
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    //save the user to the database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    newUser.password = undefined;

    //send the user information back
    res.status(201).json({
      user: newUser,
    });
  } catch (err) {
    //set a statuscode of 500 if it is undefined
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//handling login
exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  //validation check
  if (!errors.isEmpty()) {
    const errorsArr = errors.array().map(e => e.msg);

    const error = createError('Validation Result', 422, errorsArr);

    return next(error);
  }

  try {
    //find the user
    const user = await User.findOne({ where: { email } });

    //if the user doesn't exist
    if (!user) {
      const error = createError('Invalid email or password', 400);
      throw error;
    }

    //check if password match
    const doMatch = await bcrypt.compare(password, user.password);

    //if password doesn't match
    if (!doMatch) {
      const error = createError('Invalid email or password', 400);
      throw error;
    }

    //create a token
    const token = await jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    user.password = undefined;

    //send response
    res.status(200).json({ user, token });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//handling send reset token to user
exports.postResetPassword = async (req, res, next) => {
  const { email } = req.body;

  const errors = validationResult(req);

  //validation check
  if (!errors.isEmpty()) {
    const errorsArr = errors.array().map(e => e.msg);
    const error = createError('Validation Error', 422, errorsArr);

    next(error);
  }

  try {
    //check if user exist
    const user = await User.findOne({ where: { email } });

    //if user doesn't exist
    if (!user) {
      const error = createError('Please provide a valid email.', 404);

      throw error;
    }

    //create reset token
    const resetToken = await (
      await promisify(crypto.randomBytes)(32)
    ).toString('hex');

    //save reset token and its expiration to database
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;

    await user.save();

    //send email with the reset token link
    await emailTransporter.sendMail({
      to: email,
      subject: 'Reset Password',
      html: `
      <p>You had just requested a password reset. Press <a href="http://localhost:3000/reset/${resetToken}">this link</a> to reset your password.Please ignore this message if you did not requested a password reset.</p>
    `,
    });

    //send response
    res
      .status(200)
      .json({ message: 'Email with reset token sent to the user.' });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//handling reset password
exports.patchResetPassword = async (req, res, next) => {
  const { resetToken } = req.params;

  const { password: newPassword } = req.body;

  const errors = validationResult(req);

  //validation checks
  if (!errors.isEmpty()) {
    const errorsArr = errors.array().map(e => e.msg);

    const error = createError('Validation Error', 422, errorsArr);

    return next(error);
  }

  try {
    //find user using the reset token and check if token is expired
    const user = await User.findOne({
      where: { resetToken, resetTokenExpiration: { [Op.gte]: Date.now() } },
    });

    //if invalid token or expired token
    if (!user) {
      const error = createError('Invalid reset token.', 401);
      throw error;
    }

    //hashed new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    //save new password and reset the reset token and its expiration column
    user.password = hashedNewPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    //send response back
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
