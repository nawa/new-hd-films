var express = require('express');
var config =require('../config');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('index', { title: config.title });
});

module.exports = router;
