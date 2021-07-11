const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({
 path: './config.env',
});

const DB = process.env.DATABASE.replace(
 '<password>',
 process.env.DATABASE_PASSWORD
);
// const DB_LOCAL = process.env.DATABASE_LOCAL;
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
