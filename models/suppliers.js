'use strict';

module.exports = (sequelize, Sequelize) => {
  const suppliers = sequelize.define(
    'suppliers',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      supplier_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      supplier_img: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      supplier_note: {
        allowNull: true,
        type: 'varchar(255)',
      },
    },
    {
      paranoid: true,
      tableName: 'mst_suppliers',
      underscored: true,
    },
  );
  return suppliers;
};
