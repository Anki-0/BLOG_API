exports.uploadImage = async (req, res) => {
 console.log('files ->', req.files);
 try {
  const { files } = req;

  /**
   * Constructing array of URL's
   */
  const URL = files.map(
   (file) => `localhost:5000/uploads/images/${file.filename}`
  );

  console.log(URL);
  res.status(200).json({ imagesURL: URL, DATA: files });
 } catch (err) {
  res.status(400).json({ status: 'fail', messsage: err });
 }
};
