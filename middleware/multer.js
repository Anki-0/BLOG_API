const multer = require('multer');

//max file size
const maxFileSize = 1 * 1024 * 1024; // 1MB

//set storage
const storage = multer.diskStorage({
 destination: function (req, file, cb) {
  cb(null, `${__dirname}/../public/uploads/images/`);
 },
 filename: function (req, file, cb) {
  const ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
  cb(null, `${file.fieldname}-${Date.now()}${ext}`);
 },
});

const store = multer({
 storage: storage,
 fileFilter: function (req, file, cb) {
  const ext = file.originalname.substr(file.originalname.lastIndexOf('.'));

  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
   return cb(new Error('Only images are allowed'));
  }
  cb(null, true);
 },
 limits: { fileSize: maxFileSize },
});
module.exports = store;
