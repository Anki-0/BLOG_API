const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const uploadRouter = require('./routes/uploadRoutes');
const AppError = require('./utils/appError');
const AppErrorHandler = require('./middleware/appErrorHandler');

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const allowlist = [
 'http://localhost:3000',
 'http://127.0.0.1:3000',
 'https://ankitblog.tk',
 'https://dev-blog.ga',
];
const corsOptionsDelegate = function (req, callback) {
 let corsOptions;
 if (allowlist.indexOf(req.header('Origin')) !== -1) {
  corsOptions = { origin: true, credentials: true, optionsSuccessStatus: 200 }; // reflect (enable) the requested origin in the CORS response
 } else {
  corsOptions = { origin: false }; // disable CORS for this request
 }
 callback(null, corsOptions); // callback expects two parameters: error and options
};

// app.use(
//  cors({
//   origin: [
//    '*',
//    'http://localhost:3000',
//    'http://127.0.0.1:3000',
//    'https://ankitblog.tk',
//    'https://dev-blog.ga',
//   ],
//   optionsSuccessStatus: 200,
//   credentials: true,
//  })
// );
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
 app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
 req.requestTime = new Date().toISOString();
 console.log('cookies : ', req.cookies);
 console.log('cookies : ', process.env.NODE_ENV.trim() === 'production');
 next();
});
////////////
///ROUTES
app.use('/api/v1/posts', cors(corsOptionsDelegate), postRouter);
app.use('/api/v1/users', cors(corsOptionsDelegate), userRouter);
app.use('/api/v1/upload', cors(corsOptionsDelegate), uploadRouter);

app.use('/create', async (req, res) => {
 //  try {
 //   await users.sync({ alter: true });
 //   const data = await users.findAll();
 //   res.status(200).json({ message: data });
 //  } catch (err) {
 //   console.log(err);
 //  }
});

app.all('*', (req, res, next) => {
 /*
      res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
      });
      */
 //  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
 //  err.status = 'fail';
 //  err.statusCode = 404;

 next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(AppErrorHandler);
module.exports = app;
