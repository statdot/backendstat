const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

// Import your routes
const routes = require('../../routes');

// Use your routes
app.use('/.netlify/functions/server', routes);

module.exports.handler = serverless(app);
