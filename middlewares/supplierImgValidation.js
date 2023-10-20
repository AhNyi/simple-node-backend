const multer = require('multer');
const err_messages = require('../config/messages');
const mimeType = ['image/png', 'image/jpeg', 'image/jpg'];

const fileFilter = (req, res, cb) => {
    if(mimeType.includes(file.mimeType)) {
        return cb(null, true);
    } else {
        if (file.fieldname === 'image') {
            req['supImg'] = file.fieldname;
        }
        req['fileValidationError'] = 'Forbidden extension';
    }
    return cb(null, false);
}

const upload = multer({
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, //5M
    },
}).fields([
    { name: 'image', maxCount: 1},
])

exports.fileUpload = (req, res, next) => {
    upload(req, res, function (error) {
        let errMsg = {};
        if (error && error.code === 'LIMIT_FILE_SIZE') {
            errMsg['supplier_img'] = [err_messages.FILE_SIZE_TOO_LARGE];
            return res.status(412).json({ message: err_messages.MISSING_REQ_BODY, errors: errMsg });
        } else if (error) {
            return res.status(500).json({ message: error.code });
        } else if (req.fileValidationError && req.supImg == 'image') {
            if (req.supImg == 'image') {
                errMsg['supplier_img_type'] = [err_messages.IMG_TYPE_NG];
            }
            return res.status(412).json({ message: err_messages.MISSING_REQ_BODY, errors: errMsg });
        } else {
            next();
        }
    });
}