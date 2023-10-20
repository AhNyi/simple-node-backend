'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('mst_suppliers', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        supplier_name: {
          allowNull: false,
          type: Sequelize.STRING,
          unique: true,
        },
        supplier_img: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        supplier_note: {
          allowNull: true,
          type: 'varchar(255)',
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      })
      .then(() => queryInterface.addIndex('mst_suppliers', ['supplier_name']));
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable('mst_suppliers');
  }
};
