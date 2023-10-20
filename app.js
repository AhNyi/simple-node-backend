const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/index');
const path = require('path');
const app = express();

const CORS_ORIGIN_DOMAIN = "https://example.com,http://localhost:3000";

const corsOptions = {
  origin: CORS_ORIGIN_DOMAIN.split(','),
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', routes);

module.exports = app;