const express = require('express');
// const userController = require('../controller/usersController');
const authController = require('../controller/authController');
const uploadController = require('../controller/uploadController');
const store = require('../middleware/multer');

const router = express.Router();

router
 .route('/image')
 .post(
  authController.potect,
  store.array('image', 12),
  uploadController.uploadImage
 );

module.exports = router;
