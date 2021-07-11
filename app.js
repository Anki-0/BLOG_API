const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const uploadRouter = require('./routes/uploadRoutes');

const app = express();
app.use(express.json({ limit: '10kb' }));

app.use(
 cors({
  origin: '*',
  optionsSuccessStatus: 200,
 })
);

app.use(helmet());
if (process.env.NODE_ENV === 'development') {
 app.use(morgan('dev'));
}

app.use(cookieParser());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
 req.requestTime = new Date().toISOString();
 console.log('cookies : ', req.cookies);
 next();
});

////////////
///ROUTES
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/upload', uploadRouter);

app.use('/create', async (req, res) => {
 //  try {
 //   await users.sync({ alter: true });
 //   const data = await users.findAll();
 //   res.status(200).json({ message: data });
 //  } catch (err) {
 //   console.log(err);
 //  }
});

module.exports = app;
