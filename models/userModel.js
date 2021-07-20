const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
 {
  user_name: { type: String, maxlength: [60, 'Can not exced 60 character'] },
  user_pass: {
   type: String,
   required: [true, 'user must have a password'],
   minlength: [8, 'Enter password greater than 8'],
   maxlength: [255, 'Can not exced 255 character'],
   select: false,
  },
  user_nickname: {
   type: String,
   maxlength: [50, 'Can not exced 50 character'],
   unique: [true, 'User Name already exits Try another one'],
  },
  user_dob: {
   type: Date,
   // required: [true, 'user must have a D.O.B'],
  },
  user_phone: {
   type: Number,
   // required: [true, 'user must have a phone number'],
   max: [10, 'Enter valid phone number'],
   min: [10, 'Enter valid phone number'],
  },
  user_email: {
   type: String,
   required: [true, 'user must have a email'],
   maxlength: [100, 'Can not exced 100 character'],
   unique: true,
  },
  user_registered: {
   type: Date,
   maxlength: [100, 'Can not exced 100 character'],
  },
  user_status: {
   type: String,
   maxlength: [100, 'Can not exced 100 character'],
  },
  user_role: {
   type: String,
   enum: {
    values: ['admin', 'member'],
    message: '{VALUE} is not supported',
   },
   default: 'member',
  },
  user_passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExp: { type: Date },
 },
 {
  timestamps: true,
 }
);

// /**Going to populate each find query */
// userSchema.pre(/^find/, function (next) {
//  this.populate({
//   path: 'user_post',
//   select:
//    '-post_title -post_content -post_date -post_modified -post_categoery -likeconnt -post_author -__v',
//  });
//  next();
// });

userSchema.pre('save', async function (next) {
 //if the passwaor is modified
 if (!this.isModified('user_pass')) return next();
 //else generate the hash for password and call next middleware
 this.user_pass = await bcrypt.hash(this.user_pass, 8);

 next();
});

userSchema.pre('save', function (next) {
 //if the passwaor is modified
 if (!this.isModified('user_pass') || this.isNew) return next();

 //1 sec in the past
 this.user_passwordChangedAt = Date.now() - 1000;

 next();
});

/************************************ * METHODS * *******************************************/

userSchema.methods.validatePassword = async function (candiadatePass, dbPass) {
 return await bcrypt.compare(candiadatePass, dbPass);
};

userSchema.methods.createPasswordResetToken = function () {
 const resetToken = crypto.randomBytes(32).toString('hex');
 this.passwordResetToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
 this.passwordResetExp = Date.now() + 10 * 60 * 1000;
 return resetToken;
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
 if (this.user_passwordChangedAt) {
  const changeTimeStamp = parseInt(
   this.user_passwordChangedAt.getTime() / 1000, //changing it ot miliseconds
   10
  );
  return JWTTimestamp < changeTimeStamp;
 }

 return false; //false means no change
};

const users = mongoose.model('users', userSchema);
module.exports = users;
