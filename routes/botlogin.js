var express     = require('express');
var authHelper  = require("../authHelper");
var request     = require('request');
var url         = require("url");
var async       = require("async");
var parseString = require('xml2js').parseString;
var router      = express.Router();
var request     = require('request');
var session     = require('express-session');

/**
  * @module : botlogin
  * @desc   : Get home page
  * @return : load main index file
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.get('/', function(req, res, next) {
    if (!req.session.isOutlook) {
      res.render('botlogin', { title: 'Softweb Smart Office login', message: "IOTWEBAPP" });
    }
    else {
      res.render('index', { title: 'JLL - Roombit', message: "IOTWEBAPP" });
    }  
});
module.exports = router;