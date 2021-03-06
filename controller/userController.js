const users = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAync');

exports.updateUser = catchAsync(async (req, res, next) => {
 console.log('BODY====>', req.body);

 const updatedUser = await users.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true,
 });
 //  await updatedUser.save();
 console.log(req.params.id);
 if (!updatedUser) {
  return next(new AppError('Failed to Post the article!!', 400));
 }
 res.status(200).json({
  status: 'success',
  message: 'Update Done',

  updatedUser,
 });
});

exports.getUser = catchAsync(async (req, res, next) => {
 console.log(req.params.id);

 const user = await users.findById(req.params.id);
 if (!user) {
  return next(new AppError('User Not Found!!', 404));
 }
 res.status(200).json({ status: 'success', User: user });
});
