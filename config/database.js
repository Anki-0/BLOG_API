const mongoose = require('mongoose');

// const DB = process.env.DATABASE.replace(
//  '<PASSWORD>',
//  process.env.DATABASE_PASSWORD
// );
const DB_LOCAL = process.env.DATABASE_LOCAL;
mongoose
 .connect(DB_LOCAL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  createIndexes: true,
 })
 .then(() => {
  console.log('DB CONNECTED!!');
 });
