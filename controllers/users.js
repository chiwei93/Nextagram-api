const createError = require('../util/errors');
const User = require('../models/user');
const Following = require('../models/following');
const getFollowsAndLikes = require('../util/followsAndLikes');

//for getting the user's own information
exports.getMe = async (req, res, next) => {
  const { user, userId } = req;

  try {
    //get the likes and followers
    const followAndLikesObj = await getFollowsAndLikes(user, userId);

    const { numLikes, numFollowers } = followAndLikesObj;

    user.password = undefined;
    user.dataValues.numLikes = numLikes;
    user.dataValues.numFollowers = numFollowers;

    res.status(200).json({
      user,
    });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//for finding a specific user
exports.getUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    //find the user in the database
    const fetchedUser = await User.findOne({
      where: { id: userId },
    });

    //if user doesn't exist
    if (!fetchedUser) {
      const error = createError('User not found.', 404);
      throw error;
    }

    //get the likes and followers
    const followsAndLikesObj = await getFollowsAndLikes(fetchedUser, userId);

    const { numLikes, numFollowers, followers } = followsAndLikesObj;

    fetchedUser.password = undefined;
    fetchedUser.dataValues.numLikes = numLikes;
    fetchedUser.dataValues.numFollowers = numFollowers;
    fetchedUser.dataValues.followers = followers;

    res.status(200).json({
      user: fetchedUser,
    });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//for toggling following
exports.postToggleFollowing = async (req, res, next) => {
  const { followeeId } = req.params;

  const { userId: followingId } = req;

  //check if the followeeId and the followingId is the same
  if (+followingId === +followeeId) {
    const error = createError('Cannot follow yourself.', 400);
    return next(error);
  }

  try {
    //check if the relationship existed
    const fetchedFollowing = await Following.findOne({
      where: { followingId, followeeId },
    });

    //if not, create the relationship
    if (!fetchedFollowing) {
      await Following.create({ followingId, followeeId });

      return res.status(201).json({ message: 'Followed successfully.' });
    }

    //if does, delete the relaltionship
    await fetchedFollowing.destroy();

    res.status(200).json({ message: 'Unfollowed successfully.' });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//for user to change their profile image
exports.patchUserProfileImage = async (req, res, next) => {
  const { userId } = req;

  const imageFile = req.file;

  //check if image exist
  if (!imageFile) {
    const error = createError(
      'Image not found. Please attached an image in the format of jpg, jpeg, png',
      400
    );

    return next(error);
  }

  try {
    //find user in the database
    const fetchedUser = await User.findByPk(userId);

    //if user is not found
    if (!fetchedUser) {
      const error = createError(
        'User not authorised to perform this action',
        401
      );
      throw error;
    }

    //updated the user's profile image and save it to the database
    fetchedUser.profileImage = imageFile.location;

    const updatedUser = await fetchedUser.save();

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
