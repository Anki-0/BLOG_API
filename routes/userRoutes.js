const express = require('express');
// const userController = require('../controller/usersController');
const authController = require('../controller/authController');

const router = express.Router();

// router.route('/').get(userController.getAllUsers);
// router.route('/:id').get(userController.getUser);

router
 .route('/validateUser')
 .get(authController.potect, authController.validateUsers);
router.route('/signup/:token?').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.potect, authController.logout);
router.route('/forget').post(authController.forgetpassword);
router.route('/reset/:token').patch(authController.resetpassword);
router
 .route('/updatePassword')
 .patch(authController.potect, authController.updatePassword);

module.exports = router;
