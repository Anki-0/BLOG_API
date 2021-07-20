const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
 const message = `Invalid ${err.path}: ${err.value}`;
 return new AppError(message, 400);
};

const handleDuplicateFiledError = (err) => {
 const keyValue = JSON.stringify(err.keyValue);
 console.log(keyValue);

 const message = `User Already Exists with ${JSON.stringify(err.keyValue)}`;
 return new AppError(message, 400);
};
const handleValidationError = (err) => {
 const errors = Object.values(err.errors).map((el) => el.message);

 const message = `Invalid Input Data: ${errors.join('. ')}`;
 return new AppError(message, 400);
};
const handelJsonWebTokenError = () => new AppError('Invalid Token', 401);
const handelJsonWebTokenExprireError = (err) => new AppError(err.message, 401);

const sendErrorDev = (err, res) => {
 res.status(err.statusCode).json({
  status: err.status,
  error: err,
  message: err.message,
  stack: err.stack,
  name: err.Error,
 });
};

const sendErrorProd = (err, res) => {
 // Operational, trusted error: send message to client
 if (err.isOperational) {
  res.status(err.statusCode).json({
   status: err.status,
   message: err.message,
  });
  // Programming or other unknown error
 } else {
  // 1) Log error
  console.error('ERROR 💥: ', err);

  // 2) Send generic message
  res.status(500).json({
   status: 'error',
   message: 'Something went very wrong!',
   error: err,
  });
 }
};

module.exports = (err, req, res, next) => {
 err.statusCode = err.statusCode || 500;
 err.status = err.status || 'error';

 if (process.env.NODE_ENV.trim() === 'development') {
  sendErrorDev(err, res);
 } else if (process.env.NODE_ENV.trim() === 'production') {
  let error = err;
  console.log('⚡', { ...error });
  if (error.name === 'CastError') {
   error = handleCastErrorDB(error);
  }
  if (error.code === 11000) {
   error = handleDuplicateFiledError(error);
  }
  if (error.name === 'ValidationError') {
   error = handleValidationError(error);
  }
  if (error.name === 'JsonWebTokenError') {
   error = handelJsonWebTokenError(error);
  }
  if (error.name === 'TokenExpiredError') {
   error = handelJsonWebTokenExprireError(error);
  }
  sendErrorProd(error, res);
 }
};
