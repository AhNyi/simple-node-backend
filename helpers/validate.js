const Validator = require('validatorjs');

const validator = (body, rules, customData, callback) => {
    let customMessages = customData.custom_messages ? customData.custom_messages : {};
    let validation = new Validator(body, rules, customMessages);
    if (customData.customAttributeNames != undefined) {
        validation.setAttributeNames(customData.customAttributeNames);
    }
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

module.exports = validator;