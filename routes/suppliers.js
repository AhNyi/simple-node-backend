const express = require('express');
const router = express.Router();
const suppliers = require('../controllers/suppliers');
const supplierValidation = require('../middlewares/validations/supplierValidation');
const { checkParamId } = require('../middlewares/validations/commonValidation');
const { fileUpload } = require('../middlewares/supplierImgValidation');

router.get('/', supplierValidation.checkSupplierGetAllRoute, suppliers.getAllSuppliers);
router.get('/get-supplier/:id', checkParamId, suppliers.getSupplierById);
router.post('/', fileUpload, supplierValidation.checkSupplierCreateRoute, suppliers.createSupplier);
router.put(
  '/:id',
  checkParamId,
  fileUpload,
  supplierValidation.checkSupplierCreateRoute,
  suppliers.editSupplier,
);
router.delete('/:id', checkParamId, suppliers.deleteSupplier);

module.exports = router;
