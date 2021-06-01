const express = require('express');
const { body } = require('express-validator');

const commentsController = require('../controllers/comments');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.post(
  '/image/:imageId',
  isAuth,
  [
    body('comment')
      .not()
      .isEmpty()
      .withMessage('Comment cannot be empty.')
      .trim(),
  ],
  commentsController.postComment
);

router.get('/image/:imageId', isAuth, commentsController.getComments);

router.post(
  '/:commentId/toggleLike',
  isAuth,
  commentsController.postToggleLike
);

router.patch(
  '/:commentId',
  isAuth,
  [
    body('comment')
      .not()
      .isEmpty()
      .withMessage('Comment cannot be empty.')
      .trim(),
  ],
  commentsController.patchComment
);

router.delete('/:commentId', isAuth, commentsController.deleteComment);

module.exports = router;
