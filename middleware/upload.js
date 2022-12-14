const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg'||
    file.mimetype === 'image/jpg'||
    file.mimetype === 'image/png')
        cb(null,true);
    else
        cb(null,false);
}

const uploadImg = multer({
    storage,
    limits:{
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
});

module.exports = {
    uploadImg
}