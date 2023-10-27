'use strict';
const db = require('../models');
const Suppliers = db.suppliers;

module.exports = {
  up: async () => {
    return Suppliers.bulkCreate([
      {
        supplier_name: 'Sup-1',
        supplier_note: 'testing one..',
      },
      {
        supplier_name: 'Sup-2',
        supplier_note: 'testing two..',
      },
      {
        supplier_name: 'Sup-3',
        supplier_note: 'testing three..',
      },
    ]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkCreate('mst_suppliers', null, {});
  },
};
