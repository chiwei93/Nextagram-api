const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const sequelize = require('./util/database');
const authRouter = require('./routes/auth');
const imageRouter = require('./routes/images');
const userRouter = require('./routes/users');
const commentRouter = require('./routes/comments');
const Image = require('./models/image');
const User = require('./models/user');
const ImageLike = require('./models/imageLike');
const Tag = require('./models/tag');
const Comment = require('./models/comment');
const Following = require('./models/following');
const ImageTag = require('./models/imageTag');
const CommentLike = require('./models/commentLike');

//create app
const app = express();

//for json body parser
app.use(express.json());

app.use(cors());

app.use(helmet());

app.use(morgan('dev'));

//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/images', imageRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/comments', commentRouter);

//global error handling middleware
app.use((err, req, res, next) => {
  console.log(err);

  const statusCode = err.statusCode;
  const message = err.message;
  const errors = err.errors;

  return res.status(statusCode).json({
    message,
    errors,
  });
});

//defining relationships
//one to many between user and comment
Comment.belongsTo(User);
User.hasMany(Comment, { onDelete: 'CASCADE', hooks: true });

//one to many between image and comment
Comment.belongsTo(Image);
Image.hasMany(Comment, { onDelete: 'CASCADE', hooks: true });

//one to many between user and images
Image.belongsTo(User);
User.hasMany(Image, { onDelete: 'CASCADE', hooks: true });

//many to many between images and tags
Image.belongsToMany(Tag, { through: ImageTag });
Tag.belongsToMany(Image, { through: ImageTag });

//one to many between user and likes
ImageLike.belongsTo(User);
User.hasMany(ImageLike, { onDelete: 'CASCADE', hooks: true });

//one to many between image and likes
ImageLike.belongsTo(Image);
Image.hasMany(ImageLike, { onDelete: 'CASCADE', hooks: true });

//one to many between commentLike and comment
CommentLike.belongsTo(Comment);
Comment.hasMany(CommentLike, { onDelete: 'CASCADE', hooks: true });

//one to many between user and commentLike
CommentLike.belongsTo(User);
User.hasMany(CommentLike, { onDelete: 'CASCADE', hooks: true });

//many to many between users (following and followee)
User.belongsToMany(User, {
  as: 'Following',
  through: Following,
  foreignKey: 'followingId',
  otherKey: 'followeeId',
});

const port = process.env.PORT || 8000;

//sync tables in database
sequelize
  .sync()
  // .sync({ force: true })
  .then(result => {
    app.listen(port, () => {
      console.log(`app listening on port ${port}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
