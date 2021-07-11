class APIfeatures {
 constructor(query, queryString) {
  this.query = query;
  this.queryString = queryString;
 }

 filter() {
  //FILTERING
  const queryObj = { ...this.queryString };
  console.log('UNFILTERED QUERY => ', this.queryString);

  const excludeField = ['page', 'sort', 'limit', 'field'];
  excludeField.forEach((el) => delete queryObj[el]);

  console.log('FILTERED QUERY => ', queryObj);
  //ADVANCE FILTTRING
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/, (match) => `$${match}`);

  this.query = this.query.find(JSON.parse(queryStr));
  //let query = Tour.find(JSON.parse(queryStr));

  return this;
 }

 sort() {
  //SORTING
  if (this.queryString.sort) {
   const sortBy = this.queryString.sort.split(',').join(' ');

   this.query = this.query.sort(sortBy);
  } else {
   this.query = this.query.sort('-createdAt');
  }

  return this;
 }

 limitingFileds() {
  /*console.log(
         'req.query.fields =>',
         this.queryString.fields.split(',').join(' ')
        );*/

  //LIMITING THE SEARCH
  if (this.queryString.fields) {
   const fields = this.queryString.fields.split(',').join(' ');
   this.query = this.query.select(fields);
  } else {
   this.query = this.query.select('-__v');
  }
  return this;
 }

 pagination() {
  //PAGINATTION
  const page = parseInt(this.queryString.page, 16) || 1;
  const limit = parseInt(this.queryString.limit, 16) || 100;
  const skip = (page - 1) * limit;

  this.query = this.query.skip(skip).limit(limit);

  return this;
 }
}

module.exports = APIfeatures;
