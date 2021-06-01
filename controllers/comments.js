const { validationResult } = require('express-validator');

const Comment = require('../models/comment');
const createError = require('../util/errors');
const Image = require('../models/image');
const CommentLike = require('../models/commentLike');

//for updating comment
exports.patchComment = async (req, res, next) => {
  const { commentId } = req.params;

  const { comment } = req.body;

  const errors = validationResult(req);

  //validation check
  if (!errors.isEmpty()) {
    const errorsArr = errors.array().map(e => e.msg);
    const error = createError('Validation Error', 422, errorsArr);

    return next(error);
  }

  try {
    //fetch comment from database
    const fetchedComment = await Comment.findByPk(commentId);

    //if comment doesn't exist
    if (!fetchedComment) {
      const error = createError('Comment not found.', 404);
      throw error;
    }

    //updated the comment and save to database
    fetchedComment.comment = comment;

    const updatedComment = await fetchedComment.save();

    res.status(200).json({ comment: updatedComment });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//for deleting comment
exports.deleteComment = async (req, res, next) => {
  const { commentId } = req.params;

  try {
    //find comment in database
    const comment = await Comment.findByPk(commentId);

    //if comment doesn't exist
    if (!comment) {
      const error = createError('Comment not found.', 404);
      throw error;
    }

    //delete from database
    await comment.destroy();

    res.status(204).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//for commenting on an image
exports.postComment = async (req, res, next) => {
  const { imageId } = req.params;

  const { comment } = req.body;

  const { user } = req;

  const errors = validationResult(req);

  //validation check
  if (!errors.isEmpty()) {
    const errorsArr = errors.array().map(e => e.msg);
    const error = createError('Validation', 422, errorsArr);
    return next(error);
  }

  try {
    //fetch image
    const image = await Image.findByPk(imageId);

    //check if image exist
    if (!image) {
      const error = createError('Image not found', 404);
      throw error;
    }

    //create comment and save it to database
    const newComment = await image.createComment({ comment, userId: user.id });

    res.status(201).json({
      comment: newComment,
    });
  } catch (err) {
    //handle errors
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//for getting all the comments of an image
exports.getComments = async (req, res, next) => {
  const { imageId } = req.params;

  //build query depending on the req.query
  let queryObj = {
    order: [['createdAt', 'DESC']],
    include: { model: CommentLike, attributes: ['commentId', 'userId'] },
  };

  //check for page
  if (req.query.page) {
    queryObj = { ...queryObj, offset: +req.query.page - 1 };
  }

  //check for limit
  if (req.query.limit) {
    queryObj = { ...queryObj, limit: +req.query.limit };
  }

  try {
    //fetch image
    const image = await Image.findByPk(imageId);

    //if image doesn't exist
    if (!image) {
      const error = createError('Image not found.', 404);
      throw error;
    }

    //get all the comments
    const comments = await image.getComments(queryObj);

    res.status(200).json({ comments: comments.reverse() });
  } catch (err) {
    //handle errors
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//for toggling like on comment
exports.postToggleLike = async (req, res, next) => {
  const { commentId } = req.params;

  const { userId } = req;

  try {
    const fetchedLike = await CommentLike.findOne({
      where: { commentId, userId },
    });

    if (!fetchedLike) {
      await CommentLike.create({ commentId, userId });

      return res.status(201).json({ message: 'Comment liked successfully.' });
    }

    await fetchedLike.destroy();

    res.status(200).json({ message: 'Comment unliked successfully.' });
  } catch (err) {
    //handle errors
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
