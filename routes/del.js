var express     = require('express');
var router      = express.Router();
var moment      = require('moment');
var async       = require("async");
var requestapi  = require('request');

/**
  * @module : Delete 
  * @desc   : Helper function to print results in the console
  * @return : Print result in console
  * @author : Softweb solutions
*/
router.get('/', function (req, res) {
   res.send('respond with a resource');
});

module.exports = router;