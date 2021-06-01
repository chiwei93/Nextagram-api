const express = require('express');

const imagesController = require('../controllers/images');
const isAuth = require('../middlewares/isAuth');
const upload = require('../util/upload');

const router = express.Router();

router.post('/', isAuth, upload.single('image'), imagesController.postImage);

router.get('/', isAuth, imagesController.getImages);

router.get('/me', isAuth, imagesController.getMyImages);

router.post('/:imageId/toggleLike', isAuth, imagesController.postToggleLike);

router.get('/:imageId', isAuth, imagesController.getImage);

router.delete('/:imageId', isAuth, imagesController.deleteImage);

router.put('/edit/:imageId', isAuth, imagesController.putEditImage);

module.exports = router;
