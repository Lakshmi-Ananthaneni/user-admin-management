//for uploading files
const multer = require('multer');
const  path  = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
      //callback(null, 'uploads/ ');
      callback(null, path.join(__dirname,"../public/images/users"))
    },
    filename: function (req, file, callback) {
      //callback(null, file.fieldname);
      callback(null,Date.now() + "-" + file.originalname);
    }
  });
  exports.upload = multer({ storage: storage });