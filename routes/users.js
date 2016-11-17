var express = require('express');
var router = express.Router();

/**
  * @module : Users 
  * @desc   : Load user view
  * @return : Return Load user view
  * @author : Softweb solutions
*/
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;