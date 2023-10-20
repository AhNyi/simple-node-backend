const validator = require('../../helpers/validate');
const err_messages = require('../../config/messages');
const custom_messages = require('./validationCustomErrorMessages');
const custom_attributenames = require('./validationCustomAttributeNames');

exports.checkSupplierGetAllRoute = (req, res, next) => {
    const validationRule = {
        page: 'integer|min:0',
        size: 'integer|min:1',
    };

    validator(req.query, validationRule, {}, (err, status) => {
        if (status) {
            next();
        } else {
            res.status(412).json({ message: err_messages.MISSING_REQ_BODY, errors: err.errors });
        }
    });
};

exports.checkSupplierCreateRoute = (req, res, next) => {
    const validationRule = {
        supplier_name: 'required|string|max:250',
        supplier_note: 'string|max:500',
    };

    //if (req.baseUrl == '/api/supplier' && req.params.id) {
    //    if (typeof req.files.image === 'undefined') {
    //        validationRule['image'] = 'string';
    //    }
    //}

    let customAttributeNames = custom_attributenames.SUPPLIER;
    let customData = { custom_messages, customAttributeNames};
    validator(req.body, validationRule, customData, (err, status) => {
        if (status) {
            next();
        } else {
            res.status(412).json({ message: err_messages.MISSING_REQ_BODY, errors: err.errors });
        }
    });
};