const { Op } = require('sequelize');

const createError = require('../util/errors');
const createQuery = require('../util/query');
const Image = require('../models/image');
const Tag = require('../models/tag');
const ImageLike = require('../models/imageLike');

//for handling post images and caption for images
exports.postImage = async (req, res, next) => {
  const { user } = req;

  const { caption, tags } = req.body;

  let tagsArr;

  //check tags are included in the body
  if (tags) {
    if (tags.includes(' ')) {
      const error = createError('Tags cannot contains empty spaces', 422);

      return next(error);
    }

    tagsArr = tags.split(',');
  } else {
    tagsArr = [];
  }

  const imageFile = req.file;

  //check if image is uploaded to s3
  if (!imageFile) {
    const error = createError(
      'Image not found. Image should be in the format of png, jpg and jpeg only.',
      400
    );
    return next(error);
  }

  const imageUrl = imageFile.location;

  try {
    //save the imageurl and caption to the database
    const image = await user.createImage({ imageUrl, caption });

    //the tags are included
    if (tagsArr.length > 0) {
      //check if tags already exist
      const fetchedTags = await Tag.findAll({
        where: {
          tag: { [Op.or]: [tagsArr] },
        },
      });

      const bulkArr = [];

      //if doesn't exist, create the tag
      tagsArr.forEach(tag => {
        if (
          !fetchedTags.find(fetchedTag => fetchedTag.dataValues.tag === tag)
        ) {
          bulkArr.push({ tag: tag });
        }
      });

      if (bulkArr.length > 0) {
        const createdTags = await Tag.bulkCreate(bulkArr);

        createdTags.forEach(tag => {
          fetchedTags.push(tag);
        });
      }

      //add to the imageTag table
      await image.addTags(fetchedTags);
    }

    res.status(201).json({ image });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//getting a specific image
exports.getImage = async (req, res, next) => {
  const { imageId } = req.params;

  try {
    //find image in database
    const image = await Image.findOne({
      where: { id: imageId },
      include: [
        { model: Tag, attributes: ['tag'], through: { attributes: [] } },
        { model: ImageLike, attributes: ['imageId', 'userId'] },
      ],
    });

    //if image doesn't exist
    if (!image) {
      const error = createError('Image not found.', 404);
      throw error;
    }

    res.status(200).json({
      image,
    });
  } catch (err) {
    //handle error
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//getting all the image of a specific user
exports.getMyImages = async (req, res, next) => {
  const { userId } = req;

  //add a userId on req.query
  req.query.userId = userId;

  let queryObj = {
    order: [['createdAt', 'DESC']],
    include: [
      { model: Tag, attributes: ['tag'], through: { attributes: [] } },
      { model: ImageLike, attributes: ['imageId', 'userId'] },
    ],
  };

  //create queryObj
  queryObj = createQuery(req.query, '', queryObj);

  try {
    //find the images in the database
    const images = await Image.findAll(queryObj);

    res.status(200).json({
      images,
    });
  } catch (err) {
    //handle errors
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//handling editing captions and tags
exports.putEditImage = async (req, res, next) => {
  const { caption, tags } = req.body;

  const { imageId } = req.params;

  //check if the tag in included in the request body
  let tagsArr;
  if (tags) {
    tagsArr = tags.split(',');
  } else {
    tagsArr = [];
  }

  try {
    //find the image in the database
    const image = await Image.findByPk(imageId);

    //if image doesn't exist
    if (!image) {
      const error = createError('Image not found.', 404);
      throw error;
    }

    //updated the caption and save it to the database
    image.caption = caption;
    const newImage = await image.save();

    let updatedTagsArr;

    if (tagsArr.length > 0) {
      //check if tags already exist
      const existedTags = await Tag.findAll({
        where: {
          tag: { [Op.or]: [tagsArr] },
        },
      });

      //if the tags doesn't exist, create the tags
      const bulkCreateArr = [];

      tagsArr.forEach(tag => {
        if (!existedTags.find(existedTag => existedTag.tag === tag)) {
          bulkCreateArr.push({ tag });
        }
      });

      if (bulkCreateArr.length > 0) {
        const createdTags = await Tag.bulkCreate(bulkCreateArr);

        createdTags.forEach(tag => {
          existedTags.push(tag);
        });
      }

      updatedTagsArr = existedTags;

      //update the image's tags
      await image.setTags(existedTags);
    }

    res.status(200).json({
      image: newImage,
      tags: updatedTagsArr,
    });
  } catch (err) {
    //handle errors
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//for deleting images
exports.deleteImage = async (req, res, next) => {
  const { imageId } = req.params;

  const { userId } = req;

  try {
    //find the user's images only
    const image = await Image.findOne({ where: { id: imageId, userId } });

    //if image don't belong to user
    if (!image) {
      const error = createError('User not authorized.', 403);
      throw error;
    }

    //delete the tags, the comments and the image
    await Promise.all([image.removeTags(), image.removeComments()]);
    await image.destroy();

    res.status(204).json({
      message: 'Image deleted successfully.',
    });
  } catch (err) {
    //handle errors
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//for getting all images
exports.getImages = async (req, res, next) => {
  //check if the tag contain any empty spaces
  if (req.query.tag) {
    if (req.query.tag.includes(' ')) {
      const error = createError('Tag should not have empty spaces', 422);

      return next(error);
    }
  }

  //build the query depending on the req.query
  let queryObj = {
    order: [['createdAt', 'DESC']],
    include: [
      { model: Tag, attributes: ['tag'], through: { attributes: [] } },
      { model: ImageLike, attributes: ['imageId', 'userId'] },
    ],
  };

  //create the queryObj
  queryObj = createQuery(req.query, Tag, queryObj);

  try {
    //execute the query
    const promises = await Promise.all([
      Image.findAll(queryObj),
      Image.count(),
    ]);

    const images = promises[0];
    // const images = await Image.findAll(queryObj);

    res.status(200).json({ images, totalImages: promises[1] });
  } catch (err) {
    //handle errors
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

//handling for liking an image
exports.postToggleLike = async (req, res, next) => {
  const { imageId } = req.params;

  const { userId } = req;

  try {
    //fetch the like in the database
    const fetchedLike = await ImageLike.findOne({ where: { imageId, userId } });

    //if like doesn't exist, create the like
    if (!fetchedLike) {
      await ImageLike.create({ imageId, userId });

      return res.status(201).json({ message: 'Image liked successfully' });
    }

    //if existed, delete the like
    await fetchedLike.destroy();

    res.status(200).json({ message: 'Image unliked successfully' });
  } catch (err) {
    //handle errors
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
