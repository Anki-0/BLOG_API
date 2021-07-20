const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const users = require('../models/userModel');
const sendEmail = require('../config/email');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAync');
const catchAync = require('../utils/catchAync');

const signToken = (_id) =>
 jwt.sign({ id: _id }, process.env.JWT_SECRET, {
  expiresIn: '24h',
 });

const createSendToken = (statusCode, message, newUser, res, next) => {
 const token = signToken(newUser._id);
 console.log(token);

 const cookieOtions = {
  expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV.trim() === 'production',
  sameSite: 'none',
 };

 res.cookie('jwt', token, cookieOtions);

 users.user_password = undefined;

 res.status(statusCode).json({
  status: 'sucess',
  token,
  message: message,
 });
};

exports.signup = catchAsync(async (req, res, next) => {
 const newUser = await users.create({
  user_email: req.body.userEmail,
  user_pass: req.body.userPassword,
  user_nickname: req.body.userNickname,
  user_phone: req.body.user_phone,
  user_passwordChangedAt: req.body.user_passwordChangedAt,
 });

 if (!newUser) {
  // res.status(400).json({
  //  status: 'fail',
  //  message: err,
  // });
  next(new AppError('err', 404));
 }

 createSendToken(201, 'User_Account is Created!!', newUser, res);
});

exports.login = catchAync(async (req, res, next) => {
 const { userEmail, userPassword } = req.body;

 console.log(`${userEmail} , ${userPassword}`);

 //if useremail and useremail id not valid

 if (!userEmail || !userPassword)
  return next(new AppError('Please Enter Email and Password', 401));

 //checking if the user exist and password is valid
 const user = await users
  .findOne({ user_email: `${userEmail}` })
  .select('+user_pass');

 if (!user || !(await user.validatePassword(userPassword, user.user_pass))) {
  return next(new AppError('Please enter valid password or email', 401));
 }
 user.user_pass = undefined;
 console.log(user);

 //if every things ok then send the token to the client
 createSendToken(200, 'Loged-In Sucessfully', user, res);
});

exports.potect = catchAync(async (req, res, next) => {
 //get the token and check its existing
 //  console.log(res);
 let token;
 if (
  req.headers.authorization &&
  req.headers.authorization.startsWith('Bearer')
 ) {
  token = req.headers.authorization.split(' ')[1];
 } else if (req.cookies.jwt) {
  token = req.cookies.jwt;
 }
 console.log(`📀 Token ➡ ${token}`);

 if (!token) {
  return next(
   new AppError('You are not loggedin. login to access this part of api', 401)
  );
 }
 //verify the token
 const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
 console.log(decoded);

 //check if user is still exist
 const user = await users.findById(decoded.id);
 if (!user) {
  return next(new AppError('user Does not exist', 401));
 }

 //auth check if user change pass after the jwt issue
 if (user.changePasswordAfter(decoded.iat)) {
  return next(new AppError('Password Changed!', 401));
 }

 //grant access to the protectes routes
 req.user = user;

 next();
});

exports.restrictTo =
 (...roles) =>
 (req, res, next) => {
  if (!roles.includes(req.user.user_role)) {
   res
    .status(403)
    .json({ message: 'You are not authorised for this action!!' });
  }

  next();
 };

exports.forgetpassword = async (req, res) => {
 //1.get user email
 const user = await users.findOne({ user_email: req.body.userEmail });
 console.log(user);
 if (!req.body.userEmail)
  res.status(200).json({ message: 'please send email' });
 if (!user) {
  res.status(404).json({ message: 'User does not exist with this email!!' });
 }

 //2.generate random token
 const resetToken = user.createPasswordResetToken();
 await user.save({ validateBeforeSave: false });

 //3.send it to user vai email
 const resetURl = `${req.protocol}://${req.get(
  'host'
 )}/api/v1/users/reset/${resetToken}`;

 console.log({ resetURl });
 const message = `Forget your pasword? Submit a new req with yout new password to ${resetURl}.`;
 try {
  await sendEmail({
   email: req.body.userEmail,
   subject: 'Reset Password',
   message,
  });

  res
   .status(200)
   .json({ status: 'SUCESS', message: 'token sended to the mail' });
 } catch (err) {
  user.passwordResetToken = undefined;
  user.passwordResetExp = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(500).json({ message: 'error in sending the email', err: err });
 }
};

exports.resetpassword = async (req, res) => {
 console.log(`TOKEN => ${req.params.token}`);
 const tokenHash = crypto
  .createHash('sha256')
  .update(req.params.token)
  .digest('hex');

 const user = await users.findOne({
  passwordResetToken: tokenHash,
  passwordResetExp: { $gt: Date.now() },
 });
 console.log(user);

 if (!user) {
  res.status(400).json({ message: 'Link is epired or invalid' });
 }

 user.user_pass = req.body.userPassword;
 user.passwordResetExp = undefined;
 user.passwordResetToken = undefined;
 await user.save();

 createSendToken(200, 'Password Reset Sucessfull', user, res);
};

exports.updatePassword = async (req, res, next) => {
 //  //getting the user
 const user = await users.findById(req.user.id).select('+user_pass');
 console.log('USER =>', user);

 //  checking if the posted current password is correct
 if (!(await user.validatePassword(req.body.oldPassword, user.user_pass))) {
  res.status(401).json({ message: 'Your old password is wrong' });
 }

 console.log(req.body.newPassword);
 //updating
 user.user_pass = req.body.newPassword;
 await user.save();
 //  //new token
 createSendToken(200, 'Password is Updated', user, res);
};

exports.validateUsers = catchAsync(async (req, res, next) => {
 const { user } = req;
 if (!user) next(new AppError('Unauthorised User', 401));

 res.status(200).json({ status: 'success', isAuthenticated: true, user });
});
