const ImageLike = require('../models/imageLike');
const Following = require('../models/following');

module.exports = async (user, userId) => {
  const promises = await Promise.all([
    user.getImages({
      include: { model: ImageLike },
      attributes: [],
    }),
    Following.findAll({ where: { followeeId: userId } }),
  ]);

  const [images, followers] = promises;

  const likesArr = [];

  images.forEach(image => {
    likesArr.push(...image.dataValues.imageLikes);
  });

  return {
    numLikes: likesArr.length,
    numFollowers: followers.length,
    followers,
  };
};
