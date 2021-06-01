const express = require('express');

const usersController = require('../controllers/users');
const isAuth = require('../middlewares/isAuth');
const upload = require('../util/upload');

const router = express.Router();

router.get('/me', isAuth, usersController.getMe);

router.get('/:userId', isAuth, usersController.getUser);

router.post(
  '/:followeeId/toggleFollow',
  isAuth,
  usersController.postToggleFollowing
);

router.post(
  '/profileImage',
  isAuth,
  upload.single('image'),
  usersController.patchUserProfileImage
);

module.exports = router;
