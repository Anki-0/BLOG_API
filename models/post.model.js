const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
 {
  post_title: {
   type: String,
   required: [true, 'A post must have a title'],
   maxlength: [6000, 'Title Can not exceed more than 300 character'],
   minlength: [5, 'Title Can not be less than 5 character'],
  },
  post_content: {
   type: String,
   //   required: [true, 'Must enter a content to the post'],
  },
  post_author: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'users',
  },
  post_tags: {
   type: [String],
  },
  likecount: {
   type: Number,
   default: 0,
  },
  status: {
   type: String,
   enum: {
    values: ['published', 'draft', 'trash'],
    message: '{VALUE} is not supported',
   },
  },
 },
 {
  timestamps: true,
 }
);

/** Going to populate each find query **/
postSchema.pre(/^find/, function (next) {
 this.populate({
  path: 'post_author',
  select: '-user_pass -user_email -user_phone -user_dob -user_post -__v',
 });
 next();
});
const posts = mongoose.model('posts', postSchema);
module.exports = posts;
