const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const users = require('../models/userModel');
const sendEmail = require('../config/email');

const signToken = (_id) =>
 jwt.sign({ id: _id }, process.env.JWT_SECRET, {
  expiresIn: '1d',
 });

const createSendToken = (statusCode, newUser, res) => {
 const token = signToken(newUser._id);
 console.log(token);

 const cookieOtions = {
  expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
 };

 res.cookie('jwt', token, cookieOtions);

 users.user_password = undefined;

 res.status(statusCode).json({
  status: 'SUCESS',
  token,
  data: {
   user: newUser,
  },
 });
};

exports.signup = async (req, res, _next) => {
 try {
  const newUser = await users.create({
   user_email: req.body.userEmail,
   user_pass: req.body.userPassword,
   user_nickname: req.body.userNickname,
   user_passwordChangedAt: req.body.user_passwordChangedAt,
  });

  createSendToken(201, newUser, res);
 } catch (err) {
  res.status(400).json({
   status: 'fail',
   message: err,
  });
 }
};

exports.login = async (req, res, _next) => {
 const { userEmail, userPassword } = req.body;

 console.log(userEmail);

 //if useremail and useremail id not valid

 if (!userEmail || !userPassword) {
  return res.status(400).json({ message: 'please enter email and password' });
 }

 //checking if the user exist and password is valid
 const user = await users
  .findOne({ user_email: `${userEmail}` })
  .select('+user_pass');

 console.log(user);

 if (!user || !(await user.validatePassword(userPassword, user.user_pass))) {
  return res
   .status(400)
   .json({ message: 'Please enter valid password or email' });
 }

 //if every things ok then send the token to the client
 createSendToken(200, user, res);
};

exports.potect = async (req, res, next) => {
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
  return res
   .status(401)
   .json({ message: 'You are not loggedin. login to access this part of api' });
 }
 //verify the token
 const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
 console.log(decoded);

 //check if user is still exist
 const user = await users.findById(decoded.id);
 if (!user) {
  return res.status(400).json({ message: 'user Does not exist' });
 }

 //auth check if user change pass after the jwt issue
 if (user.changePasswordAfter(decoded.iat)) {
  return res.status(400).json({ message: 'Password Changed!' });
 }

 //grant access to the protectes routes
 req.user = user;

 next();
};

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

 createSendToken(200, user, res);
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
 createSendToken(200, user, res);
};
