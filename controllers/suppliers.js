const db = require('../models');
const Op = db.Sequelize.Op;
const Suppliers = db.suppliers;
const paginate = require('../middlewares/paginate');
const err_messages = require('../config/messages');
const constant = require('../config/constant');
const { deleteSupplierImage, imageUpload } = require('../helpers/imageUploadHelper');
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
      order: [['updated_at', 'DESC']],
    });

    return res.status(200).json(paginate.paginateDate(result, page, limit));
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: err_messages.SERVER_ERROR });
  }
};

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
      return res
        .status(err.status)
        .json({ subStatusCode: err.subStatusCode, message: err.message });
    }
    return res.status(500).json({ message: err_messages.SERVER_ERROR });
  }
};

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
      message: err_messages.SUPPLIER_CREATE_SUCCESS,
      supplier_id: insertedData.id,
    };
    return res.status(200).json(result);
  } catch (err) {
    logger.error(err);
    if (err.status === 412) {
      return res
        .status(err.status)
        .json({ message: err_messages.MISSING_REQ_BODY, errors: err.message });
    }
    if (t) {
      await t.rollback();
    }
    return res.status(500).json({ message: err_messages.SERVER_ERROR });
  }
};

exports.editSupplier = async (req, res) => {
  let t;
  let uploadedImg = {};
  try {
    const id = req.params.id;
    let data = {
      supplier_name: req.body.supplier_name,
      supplier_note: req.body.supplier_note,
    };
    const supplierData = await Suppliers.findByPk(id, {
      attributes: ['supplier_img', 'supplier_name', 'createdAt'],
      raw: true,
    });
    if (supplierData === null) {
      throw {
        status: 400,
        message: err_messages.SUPPLIER_NOT_FOUND,
        subStatusCode: '01',
      };
    }
    const duplicateName = await Suppliers.findOne({
      where: {
        supplier_name: data.supplier_name,
        id: {
          [Op.ne]: id,
        },
      },
    });
    if (duplicateName) {
      throw {
        status: 412,
        message: { supplier_name: [err_messages.DUPLICATE_SUPPLIER_NAME], duplicated: true },
      };
    }
    let img_paths = {};
    let oldImagesToRemove = {};
    if (Object.keys(req.files).length > 0) {
      for (const ele of Object.keys(req.files)) {
        uploadedImg[ele] = await imageUpload(req.files[ele][0], constant.PREFIX.IMG_SUPPLIER);
        img_paths[ele] = uploadedImg[ele].filename;
      }
      // To remove old images
      if (req.files.images && supplierData.supplier_img) {
        oldImagesToRemove['old_supplier_img'] = supplierData.supplier_img;
      }
    }
    data['supplier_img'] =
      img_paths && img_paths.image ? img_paths.image : supplierData.supplier_img;
    t = await db.sequelize.transaction({ autocommit: false });
    let updatedStatus = await Suppliers.update(data, {
      where: { id: id },
      transaction: t,
    });
    if (updatedStatus != 1) {
      throw {
        status: 400,
        message: err_messages.SUPPLIER_NOT_FOUND,
        subStatusCode: '01',
      };
    }
    if (Object.keys(uploadedImg).length > 0) {
      deleteSupplierImage(oldImagesToRemove);
    }
    await t.commit();
    return res.status(200).json({
      message: err_messages.SUPPLIER_EDIT_SUCCESS,
      supplier_id: id,
    });
  } catch (err) {
    if (Object.keys(uploadedImg).length > 0) {
      deleteSupplierImage(uploadedImg);
    }
    if (err.status == 412) {
      return res.status(err.status).json({
        message: err_messages.MISSING_REQ_BODY,
        errors: err.message,
      });
    }
    if (err.status == 400) {
      logger.warn(
        `[400] ${req.method} - ${req.originalUrl} [supplier_id: ${req.params.id}] - ${err.message}`,
      );
      return res
        .status(err.status)
        .json({ subStatusCode: err.subStatusCode, message: err.message });
    }
    if (t) {
      await t.rollback();
    }
    logger.error(err);
    return res.status(500).json({ message: err_messages.SERVER_ERROR });
  }
};

exports.deleteSupplier = async (req, res) => {
  let t;
  try {
    const id = req.params.id;
    const supplierData = await Suppliers.findByPk(id);
    if (!supplierData) {
      logger.warn(
        `[400] ${req.method} - ${req.originalUrl} [id: ${id}] - ${err_messages.SUPPLIER_NOT_FOUND}`,
      );
      return res
        .status(400)
        .json({ subStatusCode: '01', message: err_messages.SUPPLIER_NOT_FOUND });
    }

    t = await db.sequelize.transaction({ autocommit: false });
    let deleteStatus = await Suppliers.destroy({
      where: {
        id,
      },
      transaction: t,
    });
    if (deleteStatus != 1) {
      await t.rollback();
      return res.status(400).json({
        subStatusCode: '01',
        message: err_messages.SUPPLIER_NOT_FOUND,
        deletedSuccess: false,
      });
    }
    await t.commit();
    return res.status(200).json({ message: err_messages.SUPPLIER_DELETE_SUCCESS });
  } catch (err) {
    if (t) {
      await t.rollback();
    }
    logger.error(err);
    return res.status(500).json({ message: err_messages.SERVER_ERROR });
  }
};
