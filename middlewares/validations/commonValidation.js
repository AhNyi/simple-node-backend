const validator = require('../../helpers/validate');
const err_messages = require('../../config/messages');

exports.checkParamId = (req, res, next) => {
    const validationRule = {
        id: 'require|integer|min:1',
    };

    validator(req.params, validationRule, {}, (err, status) => {
        if (status) {
            next();
        } else {
            res.status(412).json({
                message: err_messages.MISSING_REQ_BODY,
                errors: err.errors,
            })
        }
    })
}