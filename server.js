const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({
 path: './config.env',
});
// let DB;
// const DB = process.env.DATABASE_LOCAL; //DB_LOCAL
const DB = process.env.DATABASE.replace(
 '<password>',
 process.env.DATABASE_PASSWORD
);

// if (process.env.NODE_ENV.trim() === 'production') {
//  DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
// } else if (process.env.NODE_ENV.trim() === 'development') {
//  DB = process.env.DATABASE_LOCAL; //DB_LOCAL
// }

mongoose
 .connect(DB, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true,
 })
 .then(() => {
  console.log('DB CONNECTED!!');
 });

const port = process.env.PORT || 3001;
app.listen(port, () => {
 console.log(`⚡ Listing on port ${port}`);
});
