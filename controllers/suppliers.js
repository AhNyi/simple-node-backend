const db = require('../models');
const Op = db.Sequelize.Op;
const Suppliers = db.suppliers;
const paginate = require('../middlewares/paginate');
const err_messages = require('../config/messages');
const constant = require('../config/constant');
const { dleteSupplierImage, imageUpload } = require('../helpers/imageUploadHelper');
const { getFilterSearchData } = require('../helpers/filterSearchData');
const logger = require('../helpers/logger');


exports.getAllSuppliers = async (req, res) => {
  try {
    let { page, size, supplier_name } = req.query;
    let condition = {};
    const { limit, offset } = paginate.getPagination(page, size);
    if (supplier_name) {
      supplier_name = getFilterSearchData(supplier_name);
      condition['supplier_name'] = { [Op.like]: `%${supplier_name}%` };
    }
    const result = await Suppliers.findAndCountAll({
      limit,
      offset,
      where: condition,
      attributes: { exclude: ['deletedAt'] },
      order: [['updated_at', 'DESC']]
    });

    return res.status(200).json(paginate.paginateDate(result, page, limit));
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: err_messages.SERVER_ERROR });
  }
}

exports.getSupplierById = async (req, res) => {
  try {
    let id = req.params.id;
    const result = await Suppliers.findByPk(id, {
      attributes: { exclude: ['deletedAt'] },
    });

    if (result === null) {
      throw {
        status: 400,
        message: err_messages.SUPPLIER_NOT_FOUND,
        subStatusCode: '01',
      };
    }

    return res.status(200).json(result);
  } catch (err) {
    logger.error(err);
    if (err.status && err.status === 400) {
      return res.status(err.status).json({ subStatusCode: err.subStatusCode, message: err.message });
    }
    return res.status(500).json({ message: err_messages.SERVER_ERROR });
  }
}

exports.createSupplier = async (req, res) => {
  let t;
  let uploadedImg = {};
  try {
    let data = {
      supplier_name: req.body.supplier_name,
      supplier_note: req.body.supplier_note,
    };

    // check duplicated name
    const duplicateName = await Suppliers.findOne({
      where: { supplier_name: data.supplier_name },
    });

    if (duplicateName !== null) {
      throw {
        status: 412,
        message: { supplier_name: [err_messages.DUPLICATE_SUPPLIER_NAME], duplicated: true },
      };
    }

    // For file upload
    if (req.files) {
      for (const ele of Object.keys(req.files)) {
        uploadedImg[ele] = await imageUpload(req.files[ele][0], constant.PREFIX.IMG_SUPPLIER);
      }
      data['supplier_img'] = uploadedImg.image.filename;
    }

    // Write data into DB
    t = await db.sequelize.transaction({ autocommit: false });
    let insertedData = await Suppliers.create(data, { transaction: t });
    await t.commit();
    
    // For response data
    const result = {
      supplier_id: insertedData.id,
      supplier_name: insertedData.supplier_name,
      supplier_note: insertedData.supplier_note,
    };
    return res.status(200).json(result);
  } catch (err) {
    logger.error(err);
    if (err.status === 412) {
      return res.status(err.status).json({ message: err_messages.MISSING_REQ_BODY, errors: err.message });
    }
    if (t) {
      await t.rollback();
    }
    return res.status(500).json({ message: err_messages.SERVER_ERROR });
  }
}