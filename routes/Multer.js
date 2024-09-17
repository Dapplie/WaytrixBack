const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const multer_router = express.Router();

multer_router.post('/multer', upload.single('image'), (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imagePath = 'https://' + req.get('host') + '/uploads/' + req.file.filename;
    console.log('Image uploaded:', imagePath);
    res.send(imagePath);
});

module.exports = multer_router;
