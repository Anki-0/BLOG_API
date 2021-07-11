const express = require('express');
const postController = require('../controller/postController');
const authController = require('../controller/authController');

const router = express.Router();

// router
//  .route('/top-5-cheap')
//  .get(toursController.alias, toursController.getAllposts);

router.route('/tourStats').get(postController.toursStats);
//router.param('id', postController.checkID);
router
 .route('/')
 .get(postController.getAllPosts)
 .post(
  authController.potect,
  authController.restrictTo('admin', 'member'),
  postController.createPost
 );
router
 .route('/:id')
 .patch(
  authController.potect,
  authController.restrictTo('admin', 'member'),
  postController.updatePost
 )
 .get(postController.getPost)
 .delete(
  authController.potect,
  authController.restrictTo('admin', 'member'),
  postController.deletePost
 );

module.exports = router;
