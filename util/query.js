const { Op } = require('sequelize');

const Tag = require('../models/tag');

module.exports = (reqQuery, modelIncluded, queryObj) => {
  let newQueryObj = { ...queryObj };

  //if userId is included
  if (reqQuery.userId) {
    newQueryObj = { ...newQueryObj, where: { userId: reqQuery.userId } };
  }

  //if tag is included
  if (reqQuery.tag) {
    newQueryObj = {
      ...newQueryObj,
      include: [
        ...queryObj.include,
        {
          model: modelIncluded || Tag,
          where: {
            tag: {
              [Op.like]: `${reqQuery.tag}%`,
            },
          },
          through: {
            attributes: [],
          },
        },
      ],
    };
  }

  //if page is included
  if (reqQuery.page) {
    newQueryObj = {
      ...newQueryObj,
      offset: (+reqQuery.page - 1) * reqQuery.limit,
    };
  }

  //if limit is included
  if (reqQuery.limit) {
    newQueryObj = { ...newQueryObj, limit: +reqQuery.limit };
  }

  // console.log(newQueryObj);

  return newQueryObj;
};
