const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name')
      .not()
      .isEmpty()
      .withMessage('Please provide a value for name.')
      .trim(),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('A password should be at least 8 characters long.')
      .trim(),
    body('passwordConfirm')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match.');
        }

        return true;
      }),
  ],
  authController.postSignup
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('A password should be at least 8 characeters long.')
      .trim(),
  ],
  authController.postLogin
);

router.post(
  '/resetPassword',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email.')
      .normalizeEmail(),
  ],
  authController.postResetPassword
);

router.patch(
  '/reset/:resetToken',
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('A password should be at least 8 characters long.')
      .trim(),
    body('passwordConfirm')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match.');
        }

        return true;
      }),
  ],
  authController.patchResetPassword
);

module.exports = router;
