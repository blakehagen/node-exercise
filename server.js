'use strict';
const babel   = require('babel-core').transform('code');
const express = require('express');
const app     = express();

// ROUTES //
require('./server/server.routes.js')(app);

// EJS //
app.set('view engine', 'ejs');

// PORT //
const port = process.env.PORT || 4400;
app.listen(port, () => {
  console.log('Running on port ', port);
});