const Posts = require('../models/post.model');
// const uploads = require('../models/uploadsModel');
const APIfeatures = require('../utils/apiFeatures');

//READING DATA
// const tours = JSON.parse(
//  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

/* CHECK_ID MIDDLEWARE */

// exports.checkID = (req, res, next, val) => {
//  console.log(`tour id is ${val}`);
//  if (parseInt(req.params.id, 16) > tours.length) {
//   return res.status(404).json({
//    status: 'NOT FOUND',
//    message: 'Invalid ID',
//   });
//  }
//  next();
// };

// exports.checkBody = (req, res, next) => {
//  if (!req.body.name || !req.body.price) {
//   return res.status(400).json({
//    status: 'error',
//    message: 'Jldfj',
//   });
//  }

//  next();
// };

/**MIDDLEWARE_END**/
exports.alias = (req, res, next) => {
 req.query.limit = 5;
 req.query.sort = '-ratingAverage,price';
 req.query.field = 'name,price,ratingAverage,summary';
 next();
};

exports.getAllPosts = async (req, res) => {
 //console.log(req.query.sort);
 try {
  //EXECUTE QUERY
  const features = new APIfeatures(Posts.find(), req.query)
   .filter()
   .sort()
   .limitingFileds()
   .pagination();

  const posts = await features.query;

  res.status(200).json({
   status: 'SUCESS',
   resquestedAt: req.requestTime,
   result: posts.length,

   posts,
  });
 } catch (err) {
  //console.log('ERROR-> ', err);
  res.status(400).json({
   status: 'fail',
   message: err.message || 'INTERNAL SERVER ERROR',
  });
 }
};
/*GET_SPECIFIC_TOUR*/
exports.getPost = async (req, res) => {
 try {
  // console.log('get specific post ➡ ', req.params);

  const post = await Posts.findOne({ post_title: `${req.params.id}` });

  res.status(200).json({
   status: 'SUCESS',

   post,
  });
 } catch (err) {
  res.status(400).json({
   status: 'fail',
   message: err,
  });
 }
};
//*PATCH_TOUR*/
exports.updatePost = async (req, res) => {
 //runValidater is not workking
 console.log(req);
 try {
  const post = await Posts.findByIdAndUpdate(req.params.id, req.body, {
   new: true,
   runValidators: true,
  });

  //console.log(req.body);

  res.status(200).json({
   status: 'SUCESS',
   message: 'Update Done',
   data: {
    post,
   },
  });
 } catch (err) {
  res.status(400).json({
   status: 'fail',
   message: err,
  });
 }
};
/*CREATE_NEW_TOUR*/
exports.createPost = async (req, res) => {
 try {
  const newPost = await Posts.create(req.body);
  res.status(201).json({
   status: 'SUCESS',
   data: {
    posts: newPost,
   },
  });
 } catch (err) {
  res.status(400).json({
   status: 'fail',
   message: err,
  });
 }
};

exports.deletePost = async (req, res) => {
 try {
  const post = await Posts.findOneAndDelete({ post_title: `${req.params.id}` });
  res.status(200).json({
   status: 'SUCESS',
   post,
  });
 } catch (err) {
  res.status(400).json({
   status: 'fail',
   message: err,
  });
 }
};

exports.toursStats = async (req, res) => {
 try {
  const stages = await Posts.aggregate([
   {
    $match: { ratingsAverage: { $gte: 4.5 } },
   },
   {
    $group: {
     _id: '$ratingsAverage',
     num: { $sum: 1 },
     avgRating: { $avg: '$ratingsAverage' },
     avgPrice: { $avg: '$price' },
    },
   },
  ]);
  res.status(200).json({
   message: 'Sucess',
   data: {
    stages,
   },
  });
 } catch (err) {
  res.status(400).json({
   status: 'fail',
   messsage: err.message,
  });
 }
};
