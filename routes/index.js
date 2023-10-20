const express = require('express');
const app = express();
const supplierRoute = require('./suppliers');

app.use('/supplier', supplierRoute);

module.exports = app;