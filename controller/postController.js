const Posts = require('../models/post.model');
// const uploads = require('../models/uploadsModel');
const APIfeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAync');

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

exports.getAllPosts = catchAsync(async (req, res, next) => {
 //console.log(req.query.sort);

 //EXECUTE QUERY
 const features = new APIfeatures(Posts.find(), req.query)
  .filter()
  .sort()
  .limitingFileds()
  .pagination();

 const posts = await features.query;

 if (!posts) return next(new AppError('Can not get posts', 400));

 res.status(200).json({
  status: 'success',
  resquestedAt: req.requestTime,
  result: posts.length,
  posts,
 });
});

/*GET_SPECIFIC_TOUR*/
exports.getPost = catchAsync(async (req, res, next) => {
 // console.log('get specific post ➡ ', req.params);
 const post = await Posts.findById(req.params.id);

 if (!post) {
  return next(new AppError('No post Found with that ID', 404));
 }

 res.status(200).json({
  status: 'success',
  post,
 });
});

//*PATCH_TOUR*/
exports.updatePost = async (req, res) => {
 //runValidater is not workking
 try {
  const post = await Posts.findByIdAndUpdate(req.params.id, req.body, {
   new: true,
   runValidators: true,
  });
  await post.save();

  //console.log(req.body);

  res.status(200).json({
   status: 'success',
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
exports.createPost = catchAsync(async (req, res, next) => {
 const newPost = await Posts.create(req.body);
 console.log('create post', req.body);
 if (!newPost) return next(new AppError('Failed to Post the article!!', 400));

 res.status(201).json({
  status: 'success',
  data: {
   posts: newPost,
  },
 });
});

exports.deletePost = async (req, res) => {
 try {
  const post = await Posts.findByIdAndDelete(req.params.id);
  res.status(200).json({
   status: 'success',
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
   message: 'success',
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
